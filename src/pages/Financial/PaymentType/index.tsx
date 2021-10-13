import React, { FormEvent, useState } from 'react';
import { ColorPicker, useColor } from 'react-color-palette';
import 'react-color-palette/lib/css/styles.css';
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Popover,
  Table,
  Popconfirm,
  Space,
  Layout,
  Tag,
} from 'antd';
import { GetServerSideProps } from 'next';
import { Notification } from '../../../components/Notification';
import { getAPIClient } from '../../../services/axios';
import Highlighter from 'react-highlight-words';
import styles from '../../../styles/app.module.scss';
import { api } from '../../../services/api';
import {
  PlusOutlined,
  DeleteOutlined,
  EditFilled,
  SearchOutlined,
} from '@ant-design/icons/lib/icons/';

interface IPaymentType {
  id: string;
  name: string;
  color: any;
}

interface IProp {
  paymentTypes: IPaymentType[];
}

export default function PaymentType({ paymentTypes }: IProp) {
  const [isOpenModal, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentType, setPaymentType] = useState<IPaymentType[]>(paymentTypes);
  const [paymentTypeId, setPaymentTypeId] = useState<string>('');
  const [name, setName] = useState<string>('');

  async function handleRegister(event: FormEvent) {
    event.preventDefault();

    if (name === '') {
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Nenhum campo pode ser vazio',
      });
      return;
    }

    const data = {
      name: name,
    };

    if (paymentTypeId) {
      try {
        setLoading(true);
        const response = await api.put(
          `/financial/payment-type/${paymentTypeId}`,
          data
        );

        const filteredPaymentTypes = paymentTypes.filter((iten) => {
          if (iten.id !== paymentTypeId) {
            return iten;
          }
        });

        filteredPaymentTypes.push(response.data);

        setPaymentType(filteredPaymentTypes);

        setLoading(false);
        handleClose();
        Notification({
          type: 'success',
          title: 'Sucesso',
          description: 'Tipo editado com sucesso',
        });
      } catch (error) {
        console.error(error.response.data.message);
        Notification({
          type: 'error',
          title: 'Erro',
          description: `${error.response.data.message}`,
        });
      }
    } else {
      try {
        setLoading(true);
        const response = await api.post('/financial/payment-type', data);
        console.log(response.data);

        setLoading(false);
        Notification({
          type: 'success',
          title: 'Sucesso',
          description: 'Tipo criado com sucesso',
        });

        const newAccountPlanRegistered = response.data;
        paymentTypes.push(newAccountPlanRegistered);

        handleClose();
      } catch (error) {
        setLoading(false);
        console.error(error.response.data.message);
        Notification({
          type: 'error',
          title: 'Erro',
          description: `${error.response.data.message}`,
        });
      }
    }
  }

  async function handleEdit(id: string) {
    const searchedPaymentTypes = paymentType.find((item) => item.id === id);
    console.log(id);

    setIsModalOpen(true);
    setPaymentTypeId(id);
    setName(searchedPaymentTypes.name);
  }

  async function handleClose() {
    setIsModalOpen(false);
    setLoading(false);
    setPaymentTypeId('');
    setName('');
  }

  class SearchTable extends React.Component {
    state = {
      searchText: '',
      searchedColumn: '',
    };
    searchInput: Input;
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
          title: 'Nome da Urgência',
          dataIndex: 'name',
          key: 'name',
          width: '20%',
          ...this.getColumnSearchProps('name'),
          sorter: (a, b) => a.name.length - b.name.length,
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
                  onClick={() => handleEdit(record.id)}
                />
                {/* <Popconfirm
                  title="Confirmar remoção?"
                  onConfirm={() => handleDelete(record.id)}
                >
                  <a href="#" style={{ marginLeft: 20 }}>
                    <DeleteOutlined
                      style={{ color: '#ff0000', fontSize: '16px' }}
                    />
                  </a>
                </Popconfirm> */}
              </>
            );
          },
        },
      ];
      return <Table columns={columns} dataSource={paymentType} />;
    }
  }

  return (
    <>
      <Layout>
        <Row justify="end">
          <Col>
            <Button
              size={'large'}
              className={styles.button}
              icon={<PlusOutlined style={{ fontSize: '16px' }} />}
              onClick={() => setIsModalOpen(true)}
            >
              Cadastrar Tipo
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>
      <Modal
        title="Cadastro de tipo de pagamento"
        width={500}
        visible={isOpenModal}
        onCancel={() => {
          handleClose();
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              handleClose();
            }}
            type="default"
          >
            Cancelar
          </Button>,
          <Button
            key="submit"
            loading={loading}
            type="primary"
            onClick={handleRegister}
          >
            Salvar
          </Button>,
        ]}
      >
        <Row gutter={5} align={'middle'}>
          <Col span={20}>
            <Form.Item
              key="nameFormItem"
              labelCol={{ span: 20 }}
              label="Nome do Status:"
              labelAlign={'left'}
              style={{
                backgroundColor: 'white',
              }}
              required
            >
              <Input
                key="nameKey"
                size="large"
                placeholder="Ex: Cartão, Boleto..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Modal>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  try {
    const { data } = await apiClient.get('/financial/payment-type');

    return {
      props: {
        paymentTypes: data,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        paymentTypes: [],
      },
    };
  }
};
