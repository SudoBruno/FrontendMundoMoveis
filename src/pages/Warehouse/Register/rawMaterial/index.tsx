import React, { FormEvent, useState } from 'react';

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
import Highlighter from 'react-highlight-words';

import styles from '../../../../styles/app.module.scss';

import { Notification } from '../../../../components/Notification';
import { api } from '../../../../services/api';
import { GetServerSideProps } from 'next';
import { getAPIClient } from '../../../../services/axios';
const { Option } = Select;

interface IRawMaterial {
  id: string;
  code: string;
  name: string;
  category_id: string;
  unit_of_measurement_id: string;
  coefficient: Number;
  user_id: string;
}

interface IUnMeasure {
  id: string;
  name: string;
}

interface ICategorie {
  id: string;
  name: string;
}

interface IProps {
  rawMaterial: IRawMaterial[];
  unMeasure: IUnMeasure[];
  categorie: ICategorie[];
}
export default function rawMaterial({
  rawMaterial,
  unMeasure,
  categorie,
}: IProps) {
  const [rawMaterials, setRawMaterials] = useState(rawMaterial);
  const [unitMeasures, setUnitMeasures] = useState(unMeasure);
  const [categories, setCategories] = useState(categorie);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [idCategory, setIdCategory] = useState('');
  const [idUnitMeasure, setIdUnitMeasure] = useState('');
  const [coefficient, setCoefficient] = useState('');

  function handleClose() {
    setId('');
    setName('');
    setCode('');
    setIdCategory('');
    setCoefficient('');
    setIdUnitMeasure('');
    setIsModalOpen(false);
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (id) {
      try {
        if (
          name === '' ||
          code === '' ||
          idCategory === '' ||
          idUnitMeasure === '' ||
          coefficient === ''
        ) {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description:
              'Não foi possível cadastrar o Insumo, existem campos vazios',
          });
        }
        const data = {
          id: id,
          name: name,
          code: code,
          idCategory: idCategory,
          idUnitMeasure: idUnitMeasure,
          coefficient: coefficient,
        };
        setLoading(true);
        await api.put(`/warehouse/raw-material/${id}`, data);
        setLoading(false);
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Insumo Editado com sucesso',
        });
      } catch (error) {
        console.error(error);
        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível Editar o Insumo',
        });
        setLoading(false);
      }
    } else {
      try {
        if (
          name === '' ||
          code === '' ||
          idCategory === '' ||
          idUnitMeasure === '' ||
          coefficient === ''
        ) {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description:
              'Não foi possível cadastrar o Insumo, existem campos vazios',
          });
        }

        const data = {
          name: name,
          code: code,
          category_id: idCategory,
          unit_of_measurement_id: idUnitMeasure,
          coefficient: coefficient,
        };

        setLoading(true);
        const response = await api.post('/warehouse/raw-material/', data);

        setLoading(false);

        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Insumo Cadastrado com sucesso',
        });

        const newInsRegistered = response.data;
        rawMaterial.push(newInsRegistered);

        handleClose();
      } catch (error) {
        console.error(error);
        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível cadastrar o Insumo',
        });
        setLoading(false);
      }
    }
    setName('');
    setId('');
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/warehouse/raw-material/${id}`);

      const filterCategories = rawMaterial.filter((iten) => {
        if (iten.id !== id) {
          return iten;
        }
      });

      setRawMaterials(filterCategories);
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

  async function handleEdit(data: IRawMaterial) {
    setId(data.id);
    setName(data.name);
    setCode(data.code);

    const response = await api.get(`/warehouse/raw-material/${data.id}`);

    setIdCategory(response.data.category_id);
    setIdUnitMeasure(response.data.unit_of_measurement_id);
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
          title: 'INS',
          dataIndex: 'code',
          key: 'code',
          width: '20%',
          ...this.getColumnSearchProps('code'),
          sorter: (a, b) => a.code.length - b.code.length,
        },
        {
          title: 'Descrição',
          dataIndex: 'name',
          key: 'name',
          width: '30%',
          ...this.getColumnSearchProps('ins'),
          sorter: (a, b) => a.ins.length - b.ins.length,
        },

        {
          title: 'Un.Medida',
          dataIndex: 'unit_of_measurement_id',
          key: 'unit_of_measurement_id',
          width: '20%',
          ...this.getColumnSearchProps('unit_of_measurement_id'),
          sorter: (a, b) =>
            a.unit_of_measurement_id.length - b.unit_of_measurement_id.length,
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
      return (
        <>
          <Table columns={columns} dataSource={rawMaterials} />
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
              Cadastrar Insumo
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>
      <Modal
        width={900}
        title="Cadastro de Insumos"
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
        <Row gutter={5}>
          <Col span={12}>
            <Form.Item
              key="insFormItem"
              labelCol={{ span: 23 }}
              label="Código INS"
              labelAlign={'left'}
              style={{ backgroundColor: 'white', fontWeight: 'bold' }}
              required
            >
              <Input
                key="insName"
                size="large"
                style={{ width: 400, marginBottom: '10px' }}
                placeholder="Digite o código INS, ex: "
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              key="descriptionFormItem"
              labelCol={{ span: 23 }}
              label="Descrição:"
              labelAlign={'left'}
              style={{ backgroundColor: 'white', fontWeight: 'bold' }}
              required
            >
              <Input
                key="descriptionIns"
                size="large"
                style={{ width: 400, marginBottom: '10px' }}
                placeholder="Descrição do INS"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={12}>
            <Form.Item
              key="Categoria"
              labelCol={{ span: 23 }}
              label="Categoria:"
              labelAlign={'left'}
              style={{ backgroundColor: 'white', fontWeight: 'bold' }}
              required
            >
              <Select
                showSearch
                size="large"
                style={{ width: 400, marginBottom: '10px' }}
                placeholder="Escolha a categoria"
                value={idCategory}
                onChange={(e) => {
                  setIdCategory(e.toString());
                }}
              >
                {categories.map((categorie) => (
                  <>
                    <Option key={categorie.id} value={categorie.id}>
                      {categorie.name}
                    </Option>
                  </>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              key="Unidade de Medida"
              labelCol={{ span: 23 }}
              label="Unidade de Medida:"
              labelAlign={'left'}
              style={{ backgroundColor: 'white', fontWeight: 'bold' }}
              required
            >
              <Select
                showSearch
                size="large"
                style={{ width: 400, marginBottom: '10px' }}
                placeholder="Select a person"
                optionFilterProp="children"
                value={idUnitMeasure}
                onChange={(e) => {
                  setIdUnitMeasure(e.toString());
                }}
              >
                {unitMeasures.map((unit) => (
                  <>
                    <Option key={unit.id} value={unit.id}>
                      {unit.name}
                    </Option>
                  </>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Form.Item
            key="fatorDeConversão"
            labelCol={{ span: 23 }}
            label="Fator de Conversão:"
            labelAlign={'left'}
            style={{ backgroundColor: 'white', fontWeight: 'bold' }}
            required
          >
            <Input
              key="descriptionIns"
              size="large"
              style={{ width: 400, marginBottom: '10px' }}
              placeholder="Digite o Fator"
              value={coefficient}
              onChange={(e) => {
                setCoefficient(e.target.value);
              }}
              pattern="[0-9]+$"
            />
          </Form.Item>
        </Row>
      </Modal>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);

  try {
    const rawMaterialResponse = await apiClient.get('/warehouse/raw-material');
    const unMeaseureResponse = await apiClient.get(
      '/warehouse/unit-measurement'
    );
    const categorieResponse = await apiClient.get('/warehouse/categories');

    const rawMaterialData = rawMaterialResponse.data;
    const unMeasureData = unMeaseureResponse.data;
    const categorieData = categorieResponse.data;

    return {
      props: {
        rawMaterial: rawMaterialData,
        unMeasure: unMeasureData,
        categorie: categorieData,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        rawMaterial: [],
        unMeasure: [],
        categorie: [],
      },
    };
  }
};
