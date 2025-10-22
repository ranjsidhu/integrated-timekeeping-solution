"use client";

import { Column, Grid } from "@carbon/react";

export default function Homepage() {
  return (
    <div className="sb-css-grid-container">
      <Grid>
        <Column sm={2} md={4} lg={6}>
          <p>Small: Span 2 of 4</p>
          <p>Medium: Span 4 of 8</p>
          <p>Large: Span 6 of 16</p>
        </Column>
        <Column sm={2} md={2} lg={3}>
          <p>Small: Span 2 of 4</p>
          <p>Medium: Span 2 of 8</p>
          <p>Large: Span 3 of 16</p>
        </Column>
        <Column sm={0} md={2} lg={3}>
          <p>Small: Span 0 of 4</p>
          <p>Medium: Span 2 of 8</p>
          <p>Large: Span 3 of 16</p>
        </Column>
        <Column sm={0} md={0} lg={4}>
          <p>Small: Span 0 of 4</p>
          <p>Medium: Span 0 of 8</p>
          <p>Large: Span 4 of 16</p>
        </Column>
        <Column sm="25%" md="50%" lg="75%">
          <p>Small: Span 25%</p>
          <p>Medium: Span 50%</p>
          <p>Large: Span 75%</p>
        </Column>
      </Grid>
    </div>
  );
}
