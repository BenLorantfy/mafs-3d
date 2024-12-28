import type { Meta, StoryObj } from '@storybook/react';

import { Border } from './Border.js';
import { Mafs3D } from './Mafs3D.js';

const meta: Meta<typeof Border> = {
  component: Border,
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