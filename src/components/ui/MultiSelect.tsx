import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import './MultiSelect.css';

interface MultiSelectOption {
  value: string;
  label: string;
  group?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder = 'Select...', label }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open]);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const getLabel = (value: string) => options.find((o) => o.value === value)?.label || value;

  // Group options
  const groups = new Map<string, MultiSelectOption[]>();
  options.forEach((opt) => {
    const g = opt.group || '';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(opt);
  });

  return (
    <div className="multi-select" ref={ref}>
      {label && <label className="multi-select__label">{label}</label>}
      <button
        type="button"
        className="multi-select__trigger"
        onClick={() => setOpen(!open)}
      >
        {selected.length === 0 ? (
          <span className="multi-select__placeholder">{placeholder}</span>
        ) : (
          <div className="multi-select__chips">
            {selected.map((v) => (
              <span key={v} className="multi-select__chip">
                {getLabel(v)}
                <button
                  type="button"
                  className="multi-select__chip-remove"
                  onClick={(e) => { e.stopPropagation(); toggle(v); }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        <ChevronDown size={16} className="multi-select__arrow" />
      </button>

      {open && (
        <div className="multi-select__dropdown">
          {Array.from(groups.entries()).map(([groupName, groupOpts]) => (
            <div key={groupName}>
              {groupName && <div className="multi-select__group-label">{groupName}</div>}
              {groupOpts.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`multi-select__option ${selected.includes(opt.value) ? 'multi-select__option--selected' : ''}`}
                  onClick={() => toggle(opt.value)}
                >
                  <span className="multi-select__checkbox">
                    {selected.includes(opt.value) && '✓'}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
