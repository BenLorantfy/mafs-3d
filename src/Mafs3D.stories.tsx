import type { Meta, StoryObj } from '@storybook/react';

import { Mafs3D } from './Mafs3D.js';
import { Coordinates } from './Coordinates.js';

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
    children: <Coordinates />
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};