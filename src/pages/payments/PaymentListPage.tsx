import React from 'react';
import { Typography, Card, Empty } from 'antd';

const { Title } = Typography;

export const PaymentListPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Payments</Title>
      <Card>
        <Empty description="Payment management coming soon..." />
      </Card>
    </div>
  );
};