import type { Meta, StoryObj } from '@storybook/react';

import { Point } from './Point.js';
import { Mafs3D } from './Mafs3D.js';

const meta: Meta<typeof Point> = {
  component: Point,
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

export const Default: Story = {
    args: {
        x: 2,
        y: 2,
        z: 2
    }
};