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
import styles from '../../../styles/app.module.scss';

import { Notification } from '../../../components/Notification';
import { api } from '../../../services/api';
import { GetServerSideProps } from 'next';
import { getAPIClient } from '../../../services/axios';

const { Option } = Select;

interface IProductionLine {
  id: string;
  name: string;
  created_at: Date;
}

interface ISubLine {
  id: string;
  name: string;
  production_line_id: string;
  created_at: Date;
}


interface IProps {
  productionLine: IProductionLine[];
  subLine: ISubLine[];
  notFound: boolean;
}

export default function SubProductProcess({ productionLine, subLine }: IProps) {
  const [productionLines, setProductionLines] = useState<IProductionLine[]>(productionLine);
  const [subLines, setSubLines] = useState<ISubLine[]>(subLine);
  const [productionLineId, setProductionLineId] = useState<string>('');
  const [subProductionLineId, setSubProductionLineId] = useState<string>('');
  const [productionLineName, setProductionLineName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [id, setId] = useState<string>('');
  const [name, setName] = useState<string>('');

  function handleClose() {
    setName('');
    setSubProductionLineId('');
    setProductionLineName('');
    setProductionLineId('');
    setIsModalOpen(false);
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (subProductionLineId) {
      try {
        if (name === '') {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description: 'Não foi possível editar a Sub Linha',
          });
        }

        const data = {
          name: name,
          production_line_id: productionLineId,
        };

        setLoading(true);

        const response = await api.put(`/chronoanalysis/sub-production-line/${subProductionLineId}`, data);

        const filterSubLines = subLine.filter((iten) => {
          if (iten.id !== subProductionLineId) {
            return iten;
          }
        });
        filterSubLines.push(response.data)

        setSubLines(filterSubLines)
        setLoading(false);
        setIsModalOpen(false);
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Sub Linha Editado com sucesso',
        });
      } catch (error) {
        console.error(error);
        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível Editar o Sub Linha',
        });
        setLoading(false);
      }
    } else {
      try {
        if (name === '') {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description: 'Não foi possível cadastrar o Sub Linha',
          });
        }

        const data = {
          name: name,
          production_line_id: productionLineId,
        };

        setLoading(true);
        const response = await api.post('chronoanalysis/sub-production-line/', data);
        setLoading(false);

        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Sub Linha Cadastrado com sucesso',
        });

        const newSubLinestRegistered = response.data;

        subLine.push(newSubLinestRegistered);
        setSubLines(subLine);
        setIsModalOpen(false);
      } catch (error) {
        console.error(error);
        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível cadastrar a Sub Linha',
        });
        setLoading(false);
      }
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/chronoanalysis/sub-production-line/${id}`);

      const filterSubProductionLines = subLines.filter((iten) => {
        if (iten.id !== id) {
          return iten;
        }
      });

      setSubLines(filterSubProductionLines);
      Notification({
        type: 'success',
        title: 'Sucesso',
        description: 'Sub Linha Deletado com sucesso',
      });
    } catch (error) {
      console.error(error);
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível Deletar o Sub Linha',
      });
    }
  }

  function handleEdit(data: ISubLine) {
    console.log(data);
    setIsModalOpen(true);
    setSubProductionLineId(data.id);
    setName(data.name);
    setProductionLineId(data.production_line_id);

    const productionLineData = productionLines.find(line => line.id === data.production_line_id)
    console.log(productionLineData);


    setProductionLineName(productionLineData.name);
  }

  function handleChangeProductionLine(id: string) {
    const productionLineValue = productionLine.find(p => p.id === id);
    setProductionLineName(productionLineValue.name);

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
          title: 'Nome',
          dataIndex: 'name',
          key: 'name',
          width: '40%',
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
          <Table columns={columns} dataSource={subLines} />
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
              Cadastrar Sub Linha
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>
      <Modal
        title="Cadastro de Sub Linha"
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
            key="subProductionLineName"
            size="large"
            style={{ width: 400, marginBottom: '10px' }}
            placeholder="Nome do Sub Linha"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </Form.Item>
        <Form.Item
          labelCol={{ span: 23 }}
          label="Linha de Produção:"
          labelAlign={'left'}
          style={{ backgroundColor: 'white', fontWeight: 'bold' }}
          required
        >

          <Select
            showSearch
            key="toleranceClassificationName"
            size="large"
            value={productionLineName}
            style={{ width: 400, marginBottom: '10px' }}
            onChange={(e) => {
              setProductionLineId(e);
              handleChangeProductionLine(e);
            }}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >=
              0
            }
            filterSort={(optionA, optionB) =>
              optionA.children
                .toLowerCase()
                .localeCompare(optionB.children.toLowerCase())
            }
          >
            {productionLines.map((item) => (
              <>
                <Option key={item.id} value={item.id}>
                  {item.name}
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
    const { data } = await apiClient.get('/production-line/mirror/');
    const subLine = await apiClient.get('/chronoanalysis/sub-production-line/');
    return {
      props: {
        productionLine: data,
        subLine: subLine.data,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        productionLine: [],
        subLine: [],
      },
    };
  }
};
