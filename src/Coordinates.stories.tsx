import type { Meta, StoryObj } from '@storybook/react';

import { Coordinates } from './Coordinates.js';
import { Mafs3D } from './Mafs3D.js';

const meta: Meta<typeof Coordinates> = {
  component: Coordinates,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '600px' }}>
        <Mafs3D>
          <Story />
        </Mafs3D>
      </div>
    )
  ]
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};