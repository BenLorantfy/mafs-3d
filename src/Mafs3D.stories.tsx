import type { Meta, StoryObj } from '@storybook/react';

import { Mafs3D } from './Mafs3D.js';
import { Coordinates } from './Coordinates.js';
import { Plot } from './Plot.js';

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
    children: (
      <>
        <Coordinates />
        <Plot z={(x, y) => x ** 2 + (y - 5) ** 2 + 2} />
      </>
    )
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};