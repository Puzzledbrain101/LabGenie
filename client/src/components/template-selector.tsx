import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FlaskConical, Beaker, Monitor } from 'lucide-react';

type TemplateType = 'physics' | 'chemistry' | 'computer';

interface TemplateSelectorProps {
  value: TemplateType;
  onChange: (value: TemplateType) => void;
}

const templates = [
  { type: 'physics' as TemplateType, icon: FlaskConical, color: 'text-blue-600' },
  { type: 'chemistry' as TemplateType, icon: Beaker, color: 'text-green-600' },
  { type: 'computer' as TemplateType, icon: Monitor, color: 'text-purple-600' },
];

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{t('template.select')}</Label>
      <div className="grid grid-cols-3 gap-3">
        {templates.map(({ type, icon: Icon, color }) => (
          <Card
            key={type}
            className={`p-4 cursor-pointer hover-elevate transition-all ${
              value === type ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onChange(type)}
            data-testid={`card-template-${type}`}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <Icon className={`h-6 w-6 ${color}`} />
              <p className="text-xs font-medium">{t(`template.${type}`)}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
