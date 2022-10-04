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
import { pt } from 'date-fns/locale';
import { api } from '../../../../services/api';

interface IReceipt {
  id: string;
  name: string;
  created_at: Date;
  active: boolean;
  user_id: string;
  updated_at: Date;
}

interface IProps {
  receipt: IReceipt[];
}

export default function categories({ receipt }: IProps) {
  const [csvData, setCsvData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receipts, setReceipts] = useState(receipt);
  const [headers, setHeaders] = useState([
    { label: 'Nome da Entrada', key: 'warehouse_receipt_description' },
    { label: 'Insumo', key: 'warehouse_raw_material_name' },
    { label: 'Quantidade', key: 'Quantity' },
    { label: 'Valor Total', key: 'grade_value' },
    { label: 'Criado Em', key: 'created_at' },
  ]);

  async function handleClickCsvLink(receipt_id) {
    const response = await api.get('/warehouse/receipt/raw-material', {
      params: { id: receipt_id },
    });

    response.data.forEach((receipt) => {
      receipt.created_at = format(
        new Date(receipt.created_at),
        'dd/MM/yyyy HH:mm'
      );
    });

    setCsvData(response.data);
  }
  class SearchTable extends React.Component {
    state = {
      searchText: '',
      searchedColumn: '',
    };
    searchInput;
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
          dataIndex: 'description',
          key: 'description',
          width: '30%',
          // ...this.getColumnSearchProps('description'),
          // sorter: (a, b) => a.description.length - b.description.length,
        },
        {
          title: 'Chave Fiscal',
          dataIndex: 'fiscal_key',
          key: 'fiscal_key',
          width: '20%',
          // ...this.getColumnSearchProps('fiscal_key'),
          // sorter: (a, b) => a.fiscal_key.length - b.fiscal_key.length,
        },
        {
          title: 'Número da Nota',
          dataIndex: 'fiscal_number',
          key: 'fiscal_number',
          width: '20%',
          // ...this.getColumnSearchProps('fiscal_number'),
          // sorter: (a, b) => a.fiscal_number.length - b.fiscal_number.length,
        },
        {
          title: 'Criado Em',
          dataIndex: 'created_at',
          key: 'created_at',
          width: '40%',
          // ...this.getColumnSearchProps('created_at'),
          // sorter: (a, b) => a.created_at.length - b.created_at.length,
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
          <Table columns={columns} dataSource={receipts} />
        </>
      );
    }
  }

  class SearchTableModal extends React.Component {
    state = {
      searchText: '',
      searchedColumn: '',
    };
    searchInput;
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
          title: 'Lote',
          dataIndex: 'warehouse_receipt_description',
          key: 'warehouse_receipt_description',
          width: '30%',
          // ...this.getColumnSearchProps('warehouse_receipt_description'),
          // sorter: (a, b) =>
          //   a.warehouse_receipt_description.length -
          //   b.warehouse_receipt_description.length,
        },
        {
          title: 'Insumo',
          dataIndex: 'warehouse_raw_material_name',
          key: 'warehouse_raw_material_name',
          width: '20%',
          // ...this.getColumnSearchProps('warehouse_raw_material_name'),
          // sorter: (a, b) =>
          //   a.warehouse_raw_material_name.length -
          //   b.warehouse_raw_material_name.length,
        },
        {
          title: 'Quantidade',
          dataIndex: 'quantity',
          key: 'quantity',
          width: '20%',
          // ...this.getColumnSearchProps('quantity'),
          // sorter: (a, b) => a.quantity.length - b.quantity.length,
        },
        {
          title: 'Valor Total',
          dataIndex: 'grade_value',
          key: 'grade_value',
          width: '20%',
          // ...this.getColumnSearchProps('grade_value'),
          // sorter: (a, b) => a.grade_value.length - b.grade_value.length,
        },
        {
          title: 'Criado Em',
          dataIndex: 'created_at',
          key: 'created_at',
          width: '40%',
          // ...this.getColumnSearchProps('created_at'),
          // sorter: (a, b) => a.created_at.length - b.created_at.length,
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
    <Layout>
      <Modal
        width={900}
        title="Recebimento"
        visible={isModalOpen}
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
            {csvData.length < 1 && (
              <Button
                className={styles.button}
                style={{
                  borderRadius: '26px',
                  marginTop: '10px',
                  marginLeft: '10px',
                  backgroundColor: '#1c3030',
                }}
              >
                <DownloadOutlined style={{ fontSize: '16px' }} />
              </Button>
            )}

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
                  filename={`Entrada-${format(new Date(), 'dd-MM-yyyy')}.csv`}
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
        <SearchTableModal />
      </Modal>
      <SearchTable />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  try {
    const { data } = await apiClient.get('/warehouse/receipt');

    data.forEach((receipt) => {
      receipt.created_at = format(
        new Date(receipt.created_at),
        'dd/MM/yyyy HH:mm',
        { locale: pt }
      );
    });

    return {
      props: {
        receipt: data,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        receipt: [],
      },
    };
  }
};
