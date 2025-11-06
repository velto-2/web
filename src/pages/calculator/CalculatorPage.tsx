import React from 'react';
import { Typography, Card, Empty } from 'antd';

const { Title } = Typography;

export const CalculatorPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Workforce Calculator</Title>
      <Card>
        <Empty description="Workforce calculator coming soon..." />
      </Card>
    </div>
  );
};