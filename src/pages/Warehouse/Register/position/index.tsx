import {
  DeleteOutlined,
  EditFilled,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  Input,
  Layout,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
} from 'antd';
import React, { FormEvent, useState } from 'react';
import Highlighter from 'react-highlight-words';
import styles from '../../../../styles/app.module.scss';

import { Notification } from '../../../../components/Notification';
import { api } from '../../../../services/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import warehouse from '../warehouse/index';
import { getAPIClient } from '../../../../services/axios';

const { Option } = Select;

interface IPosition {
  id: string;
  name: string;
  warehouse_id: string;
}
interface IWarehouse {
  id: string;
  name: string;
}
interface IProp {
  position: IPosition[];
  warehouse: IWarehouse[];
}

export default function position({
  position,
  warehouse,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState(position);
  const [warehouses, setWarehouses] = useState(warehouse);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [warehouseId, setWarehouseId] = useState('');

  function handleClose() {
    setId('');
    setWarehouseId('');
    setName('');
    setLoading(false);

    setIsModalOpen(false);
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (id) {
      if (name === '' || warehouseId === '') {
        setLoading(false);
        return Notification({
          type: 'error',
          title: 'Erro',
          description: 'Existem campos vazios',
        });
      }

      const data = {
        name: name,
        warehouse_id: warehouseId,
        active: true,
      };

      setLoading(true);

      const response = await api.put(`/warehouse/position/${id}`, data);

      const filterPosition = positions.filter((iten) => {
        if (iten.id !== id) {
          return iten;
        }
      });

      filterPosition.push(response.data);

      setPositions(filterPosition);

      handleClose();
      Notification({
        type: 'success',
        title: 'Enviado',
        description: 'Posição Editada com sucesso',
      });
    } else {
      try {
        if (name === '' || warehouseId === '') {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description: 'Existem campos vazios',
          });
        }
        const data = {
          name: name,
          warehouse_id: warehouseId,
        };

        setLoading(true);

        const response = await api.post(`/warehouse/position`, data);

        setLoading(false);

        setIsModalOpen(false);
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Posição Criada com sucesso',
        });

        const newPositionRegistered = response.data;
        positions.push(newPositionRegistered);

        handleClose();
      } catch (error) {
        console.error(error.response.data);
        setLoading(false);
        return Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível cadastrar a Posição',
        });
      }
    }
  }

  function handleEdit(data) {
    setId(data.id);
    setName(data.name);
    setWarehouseId(data.warehouse_id);

    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/warehouse/position/${id}`);

      const filterPosition = position.filter((iten) => {
        if (iten.id !== id) {
          return iten;
        }
      });

      setPositions(filterPosition);

      Notification({
        type: 'success',
        title: 'Sucesso',
        description: 'Posição Deletada com sucesso',
      });
    } catch (error) {
      console.error(error);
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível Deletar a Posição',
      });
    }
  }

  class SearchTable extends React.Component {
    state = {
      searchText: '',
      searchedColumn: '',
    };

    getColumnSearchProps = (dataIndex) => ({
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={(node) => {
              this.searchInput = node;
            }}
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() =>
              this.handleSearch(selectedKeys, confirm, dataIndex)
            }
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() =>
                this.handleSearch(selectedKeys, confirm, dataIndex)
              }
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Buscar
            </Button>
            <Button
              onClick={() => this.handleReset(clearFilters)}
              size="small"
              style={{ width: 90 }}
            >
              Limpar
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) =>
        record[dataIndex]
          ? record[dataIndex]
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase())
          : '',
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => this.searchInput.select(), 100);
        }
      },
      render: (text) =>
        this.state.searchedColumn === dataIndex ? (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[this.state.searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        ),
    });

    handleSearch = (selectedKeys, confirm, dataIndex) => {
      confirm();
      this.setState({
        searchText: selectedKeys[0],
        searchedColumn: dataIndex,
      });
    };

    handleReset = (clearFilters) => {
      clearFilters();
      this.setState({ searchText: '' });
    };

    render() {
      const columns = [
        {
          title: 'Nome',
          dataIndex: 'name',
          key: 'name',
          width: '30%',
          ...this.getColumnSearchProps('name'),
          sorter: (a, b) => a.name.length - b.name.length,
        },
        {
          title: 'Almoxarifado',
          dataIndex: 'warehouseName',
          key: 'warehouseName',
          width: '30%',
          ...this.getColumnSearchProps('warehouseName'),
          sorter: (a, b) => a.warehouseName.length - b.warehouseName.length,
        },
        {
          title: 'Criado Em',
          dataIndex: 'created_at',
          key: 'created_at',
          width: '40%',
          ...this.getColumnSearchProps('created_at'),
          sorter: (a, b) => a.created_at.length - b.created_at.length,
        },
        {
          title: 'Operação',
          key: 'operation',
          render: (record) => {
            return (
              <>
                <EditFilled
                  style={{ cursor: 'pointer', fontSize: '16px' }}
                  onClick={() => handleEdit(record)}
                />
                {/* onClick={() => handleEdit(record)} */}
                <Popconfirm
                  title="Confirmar remoção?"
                  onConfirm={() => handleDelete(record.id)}
                >
                  <a href="#" style={{ marginLeft: 20 }}>
                    <DeleteOutlined
                      style={{ color: '#ff0000', fontSize: '16px' }}
                    />
                  </a>
                </Popconfirm>
              </>
            );
          },
        },
      ];
      return <Table columns={columns} dataSource={positions} />;
    }
  }

  return (
    <div>
      <Layout>
        <Row justify="end">
          <Col>
            <Button
              size={'large'}
              className={styles.button}
              icon={<PlusOutlined style={{ fontSize: '16px' }} />}
              onClick={() => setIsModalOpen(true)}
            >
              Cadastrar Posição
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>

      <Modal
        title="Cadastro de Posição"
        visible={isModalOpen}
        onCancel={handleClose}
        footer={[
          <Button key="back" onClick={handleClose} type="default">
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleRegister}
          >
            Salvar
          </Button>,
        ]}
      >
        <Form.Item
          labelCol={{ span: 23 }}
          label="Nome:"
          labelAlign={'left'}
          style={{ backgroundColor: 'white', fontWeight: 'bold' }}
          required
        >
          <Input
            key="positionName"
            size="large"
            style={{ width: 400, marginBottom: '10px' }}
            placeholder="Digite o Nome da Posição"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </Form.Item>
        <Form.Item
          labelCol={{ span: 23 }}
          label="Selecione o almoxarifado:"
          labelAlign={'left'}
          style={{ backgroundColor: 'white', fontWeight: 'bold' }}
          required
        >
          <Select
            showSearch
            size="large"
            style={{ width: 400, marginBottom: '10px' }}
            placeholder="Selecione..."
            value={warehouseId}
            onChange={(e) => {
              setWarehouseId(e.toString());
            }}
          >
            {warehouses.map((warehouse) => (
              <>
                <Option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </Option>
              </>
            ))}
          </Select>
        </Form.Item>
      </Modal>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  try {
    const positionResponse = await apiClient.get('warehouse/position');
    const warehouseResponse = await apiClient.get('warehouse/warehouse');

    return {
      props: {
        position: positionResponse.data,
        warehouse: warehouseResponse.data,
      },
    };
  } catch (error) {
    console.error(error);
    return { props: { position: [], warehouse: [] } };
  }
};
