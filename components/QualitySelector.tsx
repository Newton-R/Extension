import { Select } from './ui/Select';

interface QualitySelectorProps {
  value: 'high' | 'medium' | 'low';
  onChange: (value: 'high' | 'medium' | 'low') => void;
}

export function QualitySelector({ value, onChange }: QualitySelectorProps) {
  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-100">Quality</span>
        <span className="quality-badge capitalize">{value}</span>
      </div>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as 'high' | 'medium' | 'low')}
      >
        <option value="high">High (1080p / 60fps)</option>
        <option value="medium">Medium (720p / 30fps)</option>
        <option value="low">Low (480p / 24fps)</option>
      </Select>
    </div>
  );
}

interface SourcePickerProps {
  value: 'screen' | 'window' | 'tab' | 'application';
  onChange: (value: 'screen' | 'window' | 'tab' | 'application') => void;
}

export function SourcePicker({ value, onChange }: SourcePickerProps) {
  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-100">Source</span>
      </div>
      <Select
        value={value}
        onChange={(e) =>
          onChange(e.target.value as 'screen' | 'window' | 'tab' | 'application')
        }
      >
        <option value="screen">Full screen</option>
        <option value="window">Application window</option>
        <option value="tab">Browser tab</option>
        <option value="application">Custom application</option>
      </Select>
    </div>
  );
}
