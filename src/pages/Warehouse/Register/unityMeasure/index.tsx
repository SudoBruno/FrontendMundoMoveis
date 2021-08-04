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

interface UnitMeasurement {
  id: string;
  name: string;
  abbreviation: string;
}
interface props {
  itens: UnitMeasurement[];
}

export default function index({ itens }: props) {
  const [unitsMeasurements, setUnitsMeasurements] = useState(itens);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');

  const [loading, setLoading] = useState(false);

  function handleEdit(data: UnitMeasurement) {
    setName(data.name);
    setId(data.id);
    setAbbreviation(data.abbreviation);
    setIsModalOpen(true);
  }

  function handleClose() {
    setId('');
    setName('');
    setAbbreviation('');
    setIsModalOpen(false);
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();

    if (id) {
      try {
        if (name === '' || abbreviation === '') {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description: 'Não foi possível editar a unidade',
          });
        }
        const data = {
          id: id,
          name: name,
          abbreviation: abbreviation,
        };
        setLoading(true);
        await api.put(`/warehouse/unit-measurement${id}`, data);
        setLoading(false);
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Unidade Editada com sucesso',
        });
      } catch (error) {
        console.error(error);
        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível Editar a unidade',
        });
        setLoading(false);
      }
    } else {
      try {
        if (name === '' || abbreviation === '') {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description: 'Não foi possível cadastrar a unidade',
          });
        }
        const data = {
          name: name,
          abbreviation: abbreviation,
        };
        setLoading(true);
        const response = await api.post('/warehouse/unit-measurement', data);
        setLoading(false);
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Unidade Cadastrada com sucesso',
        });

        const newUnityRegistered = response.data;

        itens.push(newUnityRegistered);
        setIsModalOpen(false);
      } catch (error) {
        console.error(error);
        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível cadastrar a unidade',
        });
        setLoading(false);
      }
    }
    setName('');
    setId('');
    setAbbreviation('');
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/warehouse/unit-measurement/${id}`);

      const filterUnitsMeasurement = unitsMeasurements.filter((iten) => {
        if (iten.id !== id) {
          return iten;
        }
      });

      setUnitsMeasurements(filterUnitsMeasurement);
      Notification({
        type: 'success',
        title: 'Sucesso',
        description: 'Unidade Deletada com sucesso',
      });
    } catch (error) {
      console.error(error);
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível Deletar a unidade',
      });
    }
  }

  const getRandomuserParams = (params) => ({
    results: params.pagination.pageSize,
    page: params.pagination.current,
    ...params,
  });
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
          title: 'Descrição',
          dataIndex: 'name',
          key: 'name',
          width: '20%',
          ...this.getColumnSearchProps('name'),
          sorter: (a, b) => a.name.length - b.name.length,
        },
        {
          title: 'Unidade',
          dataIndex: 'abbreviation',

          key: 'abbreviation',
          ...this.getColumnSearchProps('abbreviation'),
          sorter: (a, b) => a.abbreviation.length - b.abbreviation.length,
        },
        {
          title: 'Operação',
          key: 'aaa',
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

      return (
        <>
          <Table columns={columns} dataSource={unitsMeasurements} />
        </>
      );
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
              Cadastrar Unidade
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>
      <Modal
        title="Cadastro de Unidade de Medida"
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
          label="Descrição"
          labelAlign={'left'}
          style={{ backgroundColor: 'white', fontWeight: 'bold' }}
          required
        >
          <Input
            key="descriptionName"
            size="large"
            style={{ width: 400, marginBottom: '10px' }}
            placeholder="Descrição da unidade, ex: Litro, Metros Quadrados, ..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </Form.Item>

        <Form.Item
          labelCol={{ span: 23 }}
          label="Abreviação:"
          labelAlign={'left'}
          style={{ backgroundColor: 'white', fontWeight: 'bold' }}
          required
        >
          <Input
            key="abbreviation"
            size="large"
            style={{ width: 400, marginBottom: '10px' }}
            placeholder="Digite a Abreviação, ex: L, M²"
            value={abbreviation}
            onChange={(e) => {
              setAbbreviation(e.target.value);
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
    const { data } = await apiClient.get('/warehouse/unit-measurement');

    return {
      props: {
        itens: data,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        itens: [],
      },
    };
  }
};
