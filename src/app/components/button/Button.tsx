import { ReactNode } from 'react';

import { Button, ButtonStylesParams, MantineProvider } from '@mantine/core';

interface MantineButtonProps {
  disabled: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

enum PaddingToken {
  sm = '8px',
  md = '12px',
}

enum BorderRadius {
  md = '10px',
}

export function MantineButton({ disabled, icon, label, onClick }: MantineButtonProps) {
  return (
    <MantineProvider
      theme={{
        components: {
          Button: {
            // Subscribe to theme and component params
            styles: (theme, params: ButtonStylesParams, { variant }) => ({
              root: {
                height: '36px',
                padding: `${PaddingToken.sm} ${PaddingToken.md}`,
                fontWeight: 500,
                fontSize: '14px',
                transition: 'all 0.2s',
                borderRadius: `${BorderRadius.md}`,
                border: '1px solid',

                backgroundColor:
                  variant === 'filled'
                    ? theme.colors[params.color || theme.primaryColor][9]
                    : undefined,
              },
            }),
          },
        },
      }}
    >
      <Button leftIcon={icon} variant="filled" onClick={onClick} disabled={disabled}>
        {label}
      </Button>
    </MantineProvider>
  );
}
