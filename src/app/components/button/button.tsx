import { styled } from 'leather-styles/jsx';
import { type ButtonVariantProps, button as buttonRecipe } from 'leather-styles/recipes';

const StyledButton = styled('button');

export type ButtonProps = Omit<
  React.ComponentProps<typeof StyledButton>,
  keyof ButtonVariantProps
> &
  ButtonVariantProps;

export function LeatherButton(props: ButtonProps) {
  const { children, variant, fullWidth, invert, ...rest } = props;
  return (
    <StyledButton className={buttonRecipe({ variant, fullWidth, invert })} {...rest}>
      {children}
    </StyledButton>
  );
}
