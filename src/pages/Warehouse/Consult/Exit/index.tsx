import React, { FormEvent, useState } from 'react';
import {
  DownloadOutlined,
  SearchOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { Button, Col, Input, Layout, Modal, Row, Space, Table } from 'antd';
import Highlighter from 'react-highlight-words';
import styles from '../../../../styles/app.module.scss';
import { CSVLink } from 'react-csv';
import { Notification } from '../../../../components/Notification';
import { GetServerSideProps } from 'next';
import { getAPIClient } from '../../../../services/axios';
import { format } from 'date-fns';
import { api } from '../../../../services/api';
import pt from 'date-fns/locale/pt';

interface IExit {
  id: string;
  name: string;
  created_at: Date;
  active: boolean;
  user_id: string;
  updated_at: Date;
}

interface IProps {
  exit: IExit[];
  notFound: boolean;
}

export default function categories({ exit }: IProps) {
  const [csvData, setCsvData] = useState([]);
  const [exits, setexits] = useState(exit);
  const [isOpenModal, setIsModalOpen] = useState(false);
  const [headers, setHeaders] = useState([
    { label: 'USUÁRIO', key: 'users_name' },
    { label: 'INSUMO', key: 'raw_material_name' },
    { label: 'POSIÇÃO', key: 'position_name' },
    { label: 'QUANTIDADE', key: 'quantity' },
    { label: 'CRIADO EM', key: 'created_at' },
  ]);

  async function handleClickCsvLink(exit_id: string) {
    const response = await api.get(`/warehouse/exit/${exit_id}`);

    setCsvData(response.data);
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
          title: 'Usuário',
          dataIndex: 'users_name',
          key: 'users_name',
          width: '40%',
          ...this.getColumnSearchProps('users_name'),
          sorter: (a, b) => a.users_name.length - b.users_name.length,
        },

        {
          title: 'Descrição',
          dataIndex: 'description',
          key: 'description',
          width: '40%',
          ...this.getColumnSearchProps('description'),
          sorter: (a, b) => a.description.length - b.description.length,
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
          key: 'aaa',
          width: '30%',
          render: (record) => {
            return (
              <>
                <Button
                  className={styles.button}
                  style={{
                    borderRadius: '26px',
                    marginTop: '10px',
                    marginLeft: '10px',
                    backgroundColor: '#1c3030',
                  }}
                  onClick={() => {
                    setIsModalOpen(true);
                    handleClickCsvLink(record.id);
                  }}
                >
                  <EyeOutlined />
                </Button>
              </>
            );
          },
        },
      ];
      return (
        <>
          <Table columns={columns} dataSource={exits} />
        </>
      );
    }
  }

  class SearchTableForModal extends React.Component {
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
          title: 'Usuário',
          dataIndex: 'users_name',
          key: 'users_name',
          width: '40%',
          ...this.getColumnSearchProps('users_name'),
          sorter: (a, b) => a.users_name.length - b.users_name.length,
        },

        {
          title: 'Lote',
          dataIndex: 'raw_stock_cargo',
          key: 'raw_stock_cargo',
          width: '40%',
          ...this.getColumnSearchProps('raw_stock_cargo'),
          sorter: (a, b) => a.raw_stock_cargo.length - b.raw_stock_cargo.length,
        },
        {
          title: 'Insumo',
          dataIndex: 'raw_material_name',
          key: 'raw_material_name',
          width: '40%',
          ...this.getColumnSearchProps('raw_material_name'),
          sorter: (a, b) =>
            a.raw_material_name.length - b.raw_material_name.length,
        },
        {
          title: 'Quantidade',
          dataIndex: 'quantity',
          key: 'quantity',
          width: '40%',
          ...this.getColumnSearchProps('quantity'),
          sorter: (a, b) => a.quantity.length - b.quantity.length,
        },
        {
          title: 'Posição',
          dataIndex: 'position_name',
          key: 'position_name',
          width: '40%',
          ...this.getColumnSearchProps('position_name'),
          sorter: (a, b) => a.position_name.length - b.position_name.length,
        },
        {
          title: 'Criado Em',
          dataIndex: 'created_at',
          key: 'created_at',
          width: '40%',
          ...this.getColumnSearchProps('created_at'),
          sorter: (a, b) => a.created_at.length - b.created_at.length,
        },
      ];
      return (
        <>
          <Table columns={columns} dataSource={csvData} />
        </>
      );
    }
  }

  return (
    <>
      <Layout>
        <SearchTable />
      </Layout>
      <Modal
        width={900}
        title="Saída"
        visible={isOpenModal}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button
            key="back"
            type="default"
            onClick={() => {
              setIsModalOpen(false);
            }}
          >
            Cancelar
          </Button>,
        ]}
      >
        <Row justify="end">
          <Col>
            {csvData.length > 0 && (
              <Button
                className={styles.button}
                style={{
                  borderRadius: '26px',
                  marginTop: '10px',
                  marginLeft: '10px',
                  backgroundColor: '#2F4F4F',
                }}
              >
                <CSVLink
                  data={csvData}
                  style={{ color: 'white' }}
                  filename={`Saída-${format(new Date(), 'dd-MM-yyyy')}.csv`}
                  headers={headers}
                >
                  <DownloadOutlined
                    style={{ fontSize: '16px', marginRight: '5px' }}
                  />
                  Baixar Relatório
                </CSVLink>
              </Button>
            )}
          </Col>
        </Row>
        <SearchTableForModal />
      </Modal>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  const timeZone = { locale: pt };
  try {
    const { data } = await apiClient.get('/warehouse/exit');

    data.forEach((exit) => {
      exit.created_at = format(
        new Date(exit.created_at),
        'dd/MM/yyyy HH:mm',
        timeZone
      );
    });
    return {
      props: {
        exit: data,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        categorie: [],
      },
    };
  }
};
