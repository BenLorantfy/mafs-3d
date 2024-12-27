import type { Meta, StoryObj } from '@storybook/react';

import { Mafs3D } from './Mafs3D.js';
const meta = {
  component: Mafs3D,
  tags: ['autodocs'],
} satisfies Meta<typeof Mafs3D>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};