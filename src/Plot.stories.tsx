import type { Meta, StoryObj } from '@storybook/react';

import { Plot } from './Plot.js';
import { Mafs3D } from './Mafs3D.js';
import { Coordinates } from './Coordinates.js';

const meta: Meta<typeof Plot> = {
  component: Plot,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '600px' }}>
        <Mafs3D>
          <Story />
          <Coordinates />
        </Mafs3D>
      </div>
    )
  ]
}

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        z: (x, y) => Math.sin(x) + Math.cos(y)
    }
};