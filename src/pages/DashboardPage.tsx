import { useState, useMemo, useEffect } from 'react';
import { format, parseISO, isToday, isPast, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  CalendarDays,
  ClipboardList,
  Bell,
  AlertTriangle,
  ChevronRight,
  Clock,
  CheckCircle2,
  Users,
  Activity,
  Cloud,
  Thermometer,
  Wind,
  Droplets,
} from 'lucide-react';
import './DashboardPage.css';

// Weather types
interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  description: string;
  isBlanketWeather: boolean;
}

function getWeatherDescription(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Overcast / Fog';
  if (code <= 57) return 'Drizzle';
  if (code <= 65) return 'Rain';
  if (code <= 67) return 'Freezing rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

function checkBlanketWeather(temp: number, wind: number, code: number): boolean {
  // Blanket weather: temp below 50°F, or below 60°F with rain/wind
  if (temp < 50) return true;
  if (temp < 60 && (wind > 15 || code >= 51)) return true;
  return false;
}

function useWeather(businessZip?: string | null): { weather: WeatherData | null; loading: boolean; locationName: string } {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchWeatherByCoords(lat: number, lon: number, name?: string) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`
        );
        const data = await res.json();

        if (cancelled || !data.current) return;

        const current = data.current;
        const temp = Math.round(current.temperature_2m);
        const wind = Math.round(current.wind_speed_10m);
        const code = current.weather_code;

        if (name) setLocationName(name);

        setWeather({
          temperature: temp,
          feelsLike: Math.round(current.apparent_temperature),
          humidity: Math.round(current.relative_humidity_2m),
          windSpeed: wind,
          weatherCode: code,
          description: getWeatherDescription(code),
          isBlanketWeather: checkBlanketWeather(temp, wind, code),
        });
      } catch {
        // Weather fetch failed silently
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function fetchByZip(zip: string) {
      try {
        // Use Open-Meteo geocoding to convert zip/city to coords
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(zip)}&count=1&language=en&format=json`
        );
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          const loc = geoData.results[0];
          await fetchWeatherByCoords(loc.latitude, loc.longitude, `${loc.name}, ${loc.admin1 || ''}`);
          return;
        }
      } catch { /* fall through */ }
      // Fallback to default
      await fetchWeatherByCoords(41.4993, -81.6944, 'Cleveland, OH');
    }

    // Priority: business zip > browser geolocation > default
    if (businessZip && businessZip.trim()) {
      fetchByZip(businessZip.trim());
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeatherByCoords(41.4993, -81.6944, 'Cleveland, OH'),
        { timeout: 5000 }
      );
    } else {
      fetchWeatherByCoords(41.4993, -81.6944, 'Cleveland, OH');
    }

    return () => { cancelled = true; };
  }, [businessZip]);

  return { weather, loading, locationName };
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return '#dc2626';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#22c55e';
    default:
      return '#6b7280';
  }
}

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    default:
      return priority;
  }
}

function formatCareLogType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile, activeBusiness, activeMembership } = useAuth();
  const {
    horses,
    reminders,
    events,
    careLogs,
    teamMembers,
    horseAlerts,
    completeReminder,
  } = useAppStore();

  const [completingId, setCompletingId] = useState<string | null>(null);
  const businessZip = (activeBusiness as any)?.address_zip || null;
  const { weather, loading: weatherLoading, locationName } = useWeather(businessZip);

  const userName = profile?.name || 'there';
  const isTeamPlan =
    activeBusiness?.subscription_tier === 'team' ||
    activeBusiness?.subscription_tier === 'business';
  const currentUserId = profile?.id;

  // Today's date formatted
  const todayFormatted = format(new Date(), 'EEEE, MMMM d, yyyy');

  // Pending (incomplete) reminders
  const pendingReminders = useMemo(
    () => reminders.filter((r) => !r.completed),
    [reminders]
  );

  // Reminders due today
  const todayReminders = useMemo(
    () =>
      reminders.filter((r) => {
        if (r.completed) return false;
        try {
          return isToday(parseISO(r.dueDate));
        } catch {
          return false;
        }
      }),
    [reminders]
  );

  // Reminders assigned to current user (team mode)
  const myReminders = useMemo(
    () =>
      todayReminders.filter(
        (r) => r.assignedTo && r.assignedTo === currentUserId
      ),
    [todayReminders, currentUserId]
  );

  // All other today reminders (not assigned to me)
  const otherTodayReminders = useMemo(
    () =>
      isTeamPlan
        ? todayReminders.filter(
            (r) => !r.assignedTo || r.assignedTo !== currentUserId
          )
        : todayReminders,
    [todayReminders, isTeamPlan, currentUserId]
  );

  // Today's events count
  const todayEventsCount = useMemo(
    () =>
      events.filter((e) => {
        try {
          return isToday(parseISO(e.date));
        } catch {
          return false;
        }
      }).length,
    [events]
  );

  // Horses needing attention (with overdue or upcoming reminders within 3 days)
  const horsesNeedingAttention = useMemo(() => {
    const now = new Date();
    const threeDaysFromNow = addDays(now, 3);

    const horseReminderMap = new Map<
      string,
      { overdue: number; upcoming: number }
    >();

    reminders.forEach((r) => {
      if (r.completed || !r.horseId) return;
      try {
        const dueDate = parseISO(r.dueDate);
        const horseId = r.horseId;
        const current = horseReminderMap.get(horseId) || {
          overdue: 0,
          upcoming: 0,
        };

        if (isPast(dueDate) && !isToday(dueDate)) {
          current.overdue += 1;
        } else if (dueDate <= threeDaysFromNow) {
          current.upcoming += 1;
        }

        horseReminderMap.set(horseId, current);
      } catch {
        // skip invalid dates
      }
    });

    // Also count active alerts per horse
    const alertCountMap = new Map<string, number>();
    horseAlerts
      .filter((a) => a.isActive)
      .forEach((a) => {
        alertCountMap.set(a.horseId, (alertCountMap.get(a.horseId) || 0) + 1);
      });

    // Combine the two maps into a list of horses
    const horseIds = new Set([
      ...horseReminderMap.keys(),
      ...alertCountMap.keys(),
    ]);

    return Array.from(horseIds)
      .map((horseId) => {
        const horse = horses.find((h) => h.id === horseId);
        if (!horse) return null;
        const reminderInfo = horseReminderMap.get(horseId) || {
          overdue: 0,
          upcoming: 0,
        };
        const alertCount = alertCountMap.get(horseId) || 0;
        return {
          horse,
          overdue: reminderInfo.overdue,
          upcoming: reminderInfo.upcoming,
          alertCount,
        };
      })
      .filter(Boolean) as Array<{
      horse: (typeof horses)[0];
      overdue: number;
      upcoming: number;
      alertCount: number;
    }>;
  }, [reminders, horses, horseAlerts]);

  // Recent activity (last 10 care logs, sorted by date desc)
  const recentActivity = useMemo(
    () =>
      [...careLogs]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 8),
    [careLogs]
  );

  // Handle completing a reminder
  const handleCompleteReminder = (id: string) => {
    setCompletingId(id);
    completeReminder(id);
    setTimeout(() => setCompletingId(null), 600);
  };

  // Find horse name by ID
  const getHorseName = (horseId: string | undefined): string => {
    if (!horseId) return 'General';
    const horse = horses.find((h) => h.id === horseId);
    return horse?.name || 'Unknown Horse';
  };

  // Stats
  const stats = [
    {
      label: 'Total Horses',
      value: horses.length,
      icon: <ClipboardList size={22} />,
      color: '#8B0000',
      onClick: () => navigate('/horses'),
    },
    {
      label: 'Pending Reminders',
      value: pendingReminders.length,
      icon: <Bell size={22} />,
      color: '#f59e0b',
      onClick: () => navigate('/reminders'),
    },
    {
      label: "Today's Events",
      value: todayEventsCount,
      icon: <CalendarDays size={22} />,
      color: '#1976D2',
      onClick: () => navigate('/calendar'),
    },
    {
      label: 'Team Members',
      value: teamMembers.length + 1,
      icon: <Users size={22} />,
      color: '#7B1FA2',
      onClick: () => navigate('/team'),
    },
  ];

  // Quick actions
  const quickActions = [
    {
      label: 'Log Care',
      icon: <ClipboardList size={24} />,
      color: '#8B0000',
      onClick: () => navigate('/care-log'),
    },
    {
      label: 'Add Reminder',
      icon: <Bell size={24} />,
      color: '#f59e0b',
      onClick: () => navigate('/reminders'),
    },
    {
      label: 'Add Horse',
      icon: <Plus size={24} />,
      color: '#22c55e',
      onClick: () => navigate('/horses'),
    },
    {
      label: 'View Calendar',
      icon: <CalendarDays size={24} />,
      color: '#1976D2',
      onClick: () => navigate('/calendar'),
    },
  ];

  // Render a reminder task card
  const renderTaskCard = (reminder: (typeof reminders)[0]) => {
    const isCompleting = completingId === reminder.id;
    let dueDateStr = '';
    try {
      dueDateStr = format(parseISO(reminder.dueDate), 'MMM d');
    } catch {
      dueDateStr = reminder.dueDate;
    }

    return (
      <div
        key={reminder.id}
        className={`dashboard-task-card ${isCompleting ? 'dashboard-task-card--completing' : ''}`}
      >
        <button
          className={`dashboard-task-card__checkbox ${reminder.completed ? 'dashboard-task-card__checkbox--checked' : ''}`}
          onClick={() => handleCompleteReminder(reminder.id)}
          aria-label={`Complete ${reminder.title}`}
        >
          {reminder.completed || isCompleting ? (
            <CheckCircle2 size={20} />
          ) : (
            <div className="dashboard-task-card__checkbox-empty" />
          )}
        </button>

        <div className="dashboard-task-card__content">
          <div className="dashboard-task-card__title">{reminder.title}</div>
          <div className="dashboard-task-card__meta">
            <span className="dashboard-task-card__horse">
              {getHorseName(reminder.horseId)}
            </span>
            <span className="dashboard-task-card__separator">-</span>
            <span className="dashboard-task-card__due">
              <Clock size={12} />
              {dueDateStr}
              {reminder.dueTime && ` at ${reminder.dueTime}`}
            </span>
          </div>
        </div>

        <span
          className="dashboard-task-card__priority"
          style={{
            backgroundColor: `${getPriorityColor(reminder.priority)}18`,
            color: getPriorityColor(reminder.priority),
            borderColor: `${getPriorityColor(reminder.priority)}40`,
          }}
        >
          {getPriorityLabel(reminder.priority)}
        </span>
      </div>
    );
  };

  return (
    <div className="dashboard">
      {/* Greeting */}
      <div className="dashboard__header">
        <h1 className="dashboard__greeting">
          {getGreeting()}, {userName}!
        </h1>
        <p className="dashboard__date">{todayFormatted}</p>
      </div>

      {/* Weather Widget */}
      {weather && (
        <div className={`dashboard__weather ${weather.isBlanketWeather ? 'dashboard__weather--blanket' : ''}`}>
          <div className="dashboard__weather-main">
            <div className="dashboard__weather-temp">
              <Thermometer size={20} />
              <span className="dashboard__weather-degrees">{weather.temperature}°F</span>
            </div>
            <div className="dashboard__weather-desc">
              <Cloud size={16} />
              <span>{weather.description}</span>
              {locationName && (
                <span className="dashboard__weather-location"> — {locationName}</span>
              )}
            </div>
          </div>
          <div className="dashboard__weather-details">
            <span className="dashboard__weather-detail">
              <Thermometer size={14} /> Feels like {weather.feelsLike}°F
            </span>
            <span className="dashboard__weather-detail">
              <Droplets size={14} /> Humidity {weather.humidity}%
            </span>
            <span className="dashboard__weather-detail">
              <Wind size={14} /> Wind {weather.windSpeed} mph
            </span>
          </div>
          {weather.isBlanketWeather && (
            <div className="dashboard__weather-blanket">
              Blanket Weather — Consider blanketing your horses
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="dashboard__stats">
        {stats.map((stat) => (
          <button
            key={stat.label}
            className="dashboard__stat-card"
            onClick={stat.onClick}
          >
            <div
              className="dashboard__stat-icon"
              style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div className="dashboard__stat-info">
              <span className="dashboard__stat-value">{stat.value}</span>
              <span className="dashboard__stat-label">{stat.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Today's Tasks */}
      <div className="dashboard__section">
        {isTeamPlan && myReminders.length > 0 && (
          <>
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">
                <Bell size={18} />
                Assigned to You
              </h2>
              <span className="dashboard__section-count">
                {myReminders.length}
              </span>
            </div>
            <div className="dashboard__task-list">
              {myReminders.map(renderTaskCard)}
            </div>
          </>
        )}

        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">
            <Bell size={18} />
            {isTeamPlan && myReminders.length > 0
              ? "All Today's Tasks"
              : "Today's Tasks"}
          </h2>
          <span className="dashboard__section-count">
            {otherTodayReminders.length}
          </span>
        </div>

        {otherTodayReminders.length === 0 ? (
          <div className="dashboard__empty-state">
            <CheckCircle2 size={36} className="dashboard__empty-icon" />
            <p>No tasks due today. You're all caught up!</p>
          </div>
        ) : (
          <div className="dashboard__task-list">
            {otherTodayReminders.map(renderTaskCard)}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dashboard__section">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">
            <Activity size={18} />
            Quick Actions
          </h2>
        </div>
        <div className="dashboard__quick-actions">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="dashboard__quick-action"
              onClick={action.onClick}
            >
              <div
                className="dashboard__quick-action-icon"
                style={{
                  backgroundColor: `${action.color}15`,
                  color: action.color,
                }}
              >
                {action.icon}
              </div>
              <span className="dashboard__quick-action-label">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Horses Needing Attention */}
      {horsesNeedingAttention.length > 0 && (
        <div className="dashboard__section">
          <div className="dashboard__section-header">
            <h2 className="dashboard__section-title">
              <AlertTriangle size={18} />
              Horses Needing Attention
            </h2>
            <button
              className="dashboard__section-link"
              onClick={() => navigate('/horses')}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="dashboard__attention-list">
            {horsesNeedingAttention.map(
              ({ horse, overdue, upcoming, alertCount }) => (
                <button
                  key={horse.id}
                  className="dashboard__attention-card"
                  onClick={() => navigate(`/horses/${horse.id}`)}
                >
                  <div className="dashboard__attention-avatar">
                    {horse.photo ? (
                      <img src={horse.photo} alt={horse.name} />
                    ) : (
                      <span>
                        {horse.name
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="dashboard__attention-info">
                    <span className="dashboard__attention-name">
                      {horse.name}
                    </span>
                    <div className="dashboard__attention-badges">
                      {overdue > 0 && (
                        <span className="dashboard__attention-badge dashboard__attention-badge--overdue">
                          {overdue} overdue
                        </span>
                      )}
                      {upcoming > 0 && (
                        <span className="dashboard__attention-badge dashboard__attention-badge--upcoming">
                          {upcoming} upcoming
                        </span>
                      )}
                      {alertCount > 0 && (
                        <span className="dashboard__attention-badge dashboard__attention-badge--alert">
                          {alertCount} alert{alertCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="dashboard__attention-arrow"
                  />
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="dashboard__section">
          <div className="dashboard__section-header">
            <h2 className="dashboard__section-title">
              <Activity size={18} />
              Recent Activity
            </h2>
            <button
              className="dashboard__section-link"
              onClick={() => navigate('/care-log')}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="dashboard__activity-list">
            {recentActivity.map((log) => {
              let logDate = '';
              try {
                logDate = format(
                  parseISO(log.createdAt),
                  'MMM d, h:mm a'
                );
              } catch {
                logDate = log.date || log.createdAt;
              }

              return (
                <div key={log.id} className="dashboard__activity-item">
                  <div className="dashboard__activity-dot" />
                  <div className="dashboard__activity-content">
                    <div className="dashboard__activity-text">
                      <span className="dashboard__activity-type">
                        {formatCareLogType(log.type)}
                      </span>
                      <span className="dashboard__activity-separator">
                        for
                      </span>
                      <span className="dashboard__activity-horse">
                        {getHorseName(log.horseId)}
                      </span>
                    </div>
                    <div className="dashboard__activity-meta">
                      <span className="dashboard__activity-by">
                        by {log.loggedBy}
                      </span>
                      <span className="dashboard__activity-time">
                        {logDate}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
