import type { Meta, StoryObj } from '@storybook/react';

import { Mafs3D } from './Mafs3D.js';
import { Coordinates } from './Coordinates.js';
import { Plot } from './Plot.js';
import { Border } from './Border.js';
import { Point } from './Point.js';

const meta: Meta<typeof Mafs3D> = {
  component: Mafs3D,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '600px' }}>
        <Story />
      </div>
    )
  ],
  args: {
    viewBox: { x: [-2, 5], y: [-2, 5], z: [-2, 5] },
    children: (
      <>
        <Coordinates />
        <Border />
        <Plot z={(x, y) => (x - 4) ** 2 + (y - 4) ** 2 + 2} />
        <Plot z={(x, y) => Math.sin(x) + Math.cos(y) + 2.5} />
        <Point x={2} y={2} z={2} />
      </>
    )
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};