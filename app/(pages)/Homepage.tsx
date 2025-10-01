"use client";

import { useState } from "react";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  CopyButton,
  Link,
  Loading,
} from "@/app/components";

export default function Homepage() {
  const [error, setError] = useState<boolean>(false);

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
      <Button onClick={() => setError(!error)}>Click me</Button>
      <CopyButton autoAlign />
      <Link href="/" inline>
        Testing link
      </Link>
      <Loading active={false} />
    </>
  );
}
