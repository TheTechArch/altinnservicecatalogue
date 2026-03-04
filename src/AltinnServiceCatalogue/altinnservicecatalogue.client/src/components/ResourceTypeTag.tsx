import { Popover, Paragraph, Heading } from '@digdir/designsystemet-react';
import { useLang } from '../lang';

export const RESOURCE_TYPE_COLORS: Record<string, string> = {
  AltinnApp: 'info',
  MaskinportenSchema: 'warning',
  GenericAccessResource: 'success',
  BrokerService: 'warning',
  CorrespondenceService: 'neutral',
  Altinn2Service: 'neutral',
  Consent: 'info',
  Systemresource: 'neutral',
  Default: 'neutral',
};

interface ResourceTypeTagProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ResourceTypeTag({ type, size = 'sm' }: ResourceTypeTagProps) {
  const { t } = useLang();
  const color = RESOURCE_TYPE_COLORS[type] ?? 'neutral';
  const label = t(`resourceType.${type}`);
  const description = t(`resourceType.description.${type}`);

  return (
    <Popover.TriggerContext>
      <Popover.Trigger
        inline
        data-color={color}
        data-size={size}
        className="ds-tag cursor-pointer"
        aria-label={`${label} – vis beskrivelse`}
      >
        {label}
      </Popover.Trigger>
      <Popover placement="bottom" style={{ maxWidth: '300px' }}>
        <Heading level={4} data-size="2xs" className="mb-2">
          {label}
        </Heading>
        <Paragraph data-size="sm">
          {description}
        </Paragraph>
      </Popover>
    </Popover.TriggerContext>
  );
}
