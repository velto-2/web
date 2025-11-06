import React from 'react';
import { Typography, Card, Empty } from 'antd';

const { Title } = Typography;

export const ContractListPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Contracts</Title>
      <Card>
        <Empty description="Contract management coming soon..." />
      </Card>
    </div>
  );
};