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
import { GetServerSideProps } from 'next';
import { getAPIClient } from '../../../../services/axios';

const { Option } = Select;

interface IWarehouse {
  id: string;
  name: string;
  place: string;
}

interface IProp {
  warehouse: IWarehouse[];
}
export default function warehouse({ warehouse }: IProp) {
  console.error(warehouse);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState(warehouse);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [place, setPlace] = useState('');

  function handleClose() {
    setId('');
    setName('');
    setPlace('');
    setLoading(false);

    setIsModalOpen(false);
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (id) {
      try {
        if (name === '' || place === '') {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description: 'Existem campos vazios',
          });
        }
        const data = {
          name: name,
          place: place,
        };
        setLoading(true);

        const response = await api.put(`/warehouse/warehouse/${id}`, data);

        const filterWarehouse = warehouses.filter((iten) => {
          if (iten.id !== id) {
            return iten;
          }
        });

        filterWarehouse.push(response.data);

        setWarehouses(filterWarehouse);

        setLoading(false);
        setIsModalOpen(false);
        handleClose();
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Almoxarifado Editado com sucesso',
        });
      } catch (error) {
        console.error(error);
        return Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível editar o Armazém',
        });
      }
    } else {
      try {
        if (name === '' || place === '') {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description: 'Existem campos vazios',
          });
        }
        const data = {
          name: name,
          place: place,
        };
        setLoading(true);
        const response = await api.post(`/warehouse/warehouse`, data);
        setLoading(false);

        const newWarehouseRegistered = response.data;

        warehouses.push(newWarehouseRegistered);
        setIsModalOpen(false);
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Armazém Criado com sucesso',
        });
      } catch (error) {
        console.error(error);
        return Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível cadastrar o Armazém',
        });
      }
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/warehouse/warehouse/${id}`);

      const filterWarehouses = warehouses.filter((iten) => {
        if (iten.id !== id) {
          return iten;
        }
      });

      setWarehouses(filterWarehouses);
      Notification({
        type: 'success',
        title: 'Sucesso',
        description: 'Almoxarifado Deletado com sucesso',
      });
    } catch (error) {
      console.error(error);
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível Deletar o Almoxarifado',
      });
    }
  }

  async function handleEdit(data) {
    setName(data.name);
    setPlace(data.place);
    setId(data.id);

    setIsModalOpen(true);
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
          title: 'Localizado em:',
          dataIndex: 'place',
          key: 'place',
          width: '30%',
          ...this.getColumnSearchProps('place'),
          sorter: (a, b) => a.place.length - b.place.length,
        },
        {
          title: 'Criado Em',
          dataIndex: 'created_at',
          key: 'created_at',
          width: '30%',
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
      return <Table columns={columns} dataSource={warehouses} />;
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
              Cadastrar Almoxarifado
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>

      <Modal
        title="Cadastro de Almoxarifado"
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
            key="warehouseName"
            size="large"
            style={{ width: 400, marginBottom: '10px' }}
            placeholder="Digite o Nome do Almoxarifado"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </Form.Item>
        <Form.Item
          labelCol={{ span: 23 }}
          label="Localização:"
          labelAlign={'left'}
          style={{ backgroundColor: 'white', fontWeight: 'bold' }}
          required
        >
          <Input
            key="warehousePlace"
            size="large"
            style={{ width: 400, marginBottom: '10px' }}
            placeholder="Digite a localização, ex: Matriz, chaparia, etc..."
            value={place}
            onChange={(e) => {
              setPlace(e.target.value);
            }}
          />
        </Form.Item>
      </Modal>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  try {
    const { data } = await apiClient.get('/warehouse/warehouse');

    return {
      props: {
        warehouse: data,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        warehouse: [],
      },
    };
  }
};
