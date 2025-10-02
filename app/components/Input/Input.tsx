import {
  NumberInput as CarbonNumberInput,
  PasswordInput as CarbonPasswordInput,
  TextInput as CarbonTextInput,
} from "@carbon/react";

type CarbonNumberInputProps = React.ComponentProps<typeof CarbonNumberInput>;
type CarbonPasswordInputProps = React.ComponentProps<
  typeof CarbonPasswordInput
>;
type CarbonTextInputProps = React.ComponentProps<typeof CarbonTextInput>;

type BaseInputProps = {
  "data-testid"?: string;
};

type NumberInputProps = BaseInputProps &
  CarbonNumberInputProps & { type: "number" };
type PasswordInputProps = BaseInputProps &
  CarbonPasswordInputProps & { type: "password" };
type TextInputProps = BaseInputProps & CarbonTextInputProps & { type: "text" };

// Function overloads for type safety
function Input(props: NumberInputProps): React.JSX.Element;
function Input(props: PasswordInputProps): React.JSX.Element;
function Input(props: TextInputProps): React.JSX.Element;

// Implementation
function Input({
  type,
  "data-testid": dataTestIdProp,
  ...props
}: NumberInputProps | PasswordInputProps | TextInputProps) {
  const dataTestId = dataTestIdProp ?? `${type}-input`;

  if (type === "number") {
    return (
      <CarbonNumberInput
        {...(props as CarbonNumberInputProps)}
        data-testid={dataTestId}
      />
    );
  } else if (type === "password") {
    return (
      <CarbonPasswordInput
        {...(props as CarbonPasswordInputProps)}
        data-testid={dataTestId}
      />
    );
  } else {
    return (
      <CarbonTextInput
        {...(props as CarbonTextInputProps)}
        data-testid={dataTestId}
      />
    );
  }
}

export default Input;
