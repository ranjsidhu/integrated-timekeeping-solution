"use client";

import { Button, Checkbox, CheckboxGroup } from "@/app/components";

export default function Homepage() {
  return (
    <>
      <Button kind="danger--tertiary">Testing button</Button>
      <CheckboxGroup
        className="some-class"
        helperText="Helper text goes here"
        invalidText="Invalid message goes here"
        legendText="Group label"
        warnText="Warning message goes here"
      >
        <Checkbox id="checkbox-label-1" labelText="Checkbox label" />
        <Checkbox id="checkbox-label-2" labelText="Checkbox label" />
      </CheckboxGroup>
    </>
  );
}
