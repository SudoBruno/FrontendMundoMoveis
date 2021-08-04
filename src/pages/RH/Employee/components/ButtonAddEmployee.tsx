import React, { useState } from 'react';
import { Button } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';

export default function ButtonAddEmployee() {
  const [isOpenModal, setIsOpenModal] = useState(false);

  return (
    <Button size={'large'} style={{ marginBottom: '10px', color: 'white' }}>
      Cadastrar Funcionário
      <UserAddOutlined style={{ fontSize: '16px' }} />
    </Button>
  );
}
