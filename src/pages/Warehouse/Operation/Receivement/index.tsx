import React, { FormEvent, useState } from 'react';

import {
  DeleteOutlined,
  EditFilled,
  PlusOutlined,
  SearchOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Layout,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
} from 'antd';

import Highlighter from 'react-highlight-words';
import styles from '../../../../styles/app.module.scss';

import { Notification } from '../../../../components/Notification';
import { api } from '../../../../services/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getAPIClient } from '../../../../services/axios';

const { Option } = Select;

interface IRawMaterial {
  id: string;
  name: string;
  unit_measurement_name: string;
  code: string;
  coefficient: Number;
}

interface IReaceivment {
  id: string;
  description: string;
  fiscal_key: string;
  fiscal_number: string;
}

interface IProp {
  receivement: IReaceivment[];
  rawMaterial: IRawMaterial[];
}

export default function Receivement({ rawMaterial, receivement }: IProp) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLockInsChange, setIsLockInsChange] = useState(false);
  const [id, setId] = useState('');
  const [description, setDescription] = useState('');
  const [fiscalKey, setFiscalKey] = useState('');
  const [fiscalNumber, setFiscalNumber] = useState('');
  const [receivements, setReceivements] = useState(receivement);
  const [rawMaterials, setRawMaterials] = useState(rawMaterial);
  const [rawMaterialsAdded, setRawMaterialsAdded] = useState([
    {
      id: '',
      quantity: '',
      grade_value: 0,
      unitary_value: '',
      rawMaterialName: '',
      coefficient: 0,
    },
  ]);

  async function handleRegister(e: FormEvent) {
    if (id) {
      try {
        if (description === '' || fiscalKey === '' || fiscalNumber === '') {
          Notification({
            type: 'error',
            title: 'Erro',
            description: 'Nenhum campo deve ser vazio',
          });
          setLoading(false);
          return;
        }

        let data = {
          description: description,
          fiscal_key: fiscalKey,
          fiscal_number: fiscalNumber,
        };
        setLoading(true);

        let response = await api.put(`/warehouse/receipt/${id}`, data);

        const filterReceivements = receivement.filter((iten) => {
          if (iten.id !== id) {
            return iten;
          }
        });

        filterReceivements.push(response.data);

        setReceivements(filterReceivements);

        handleClose();
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Recebimento editado com sucesso',
        });
      } catch (error) {
        console.error(error.response.message);
        setLoading(false);
        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível editar',
        });
      }
    } else {
      try {
        if (description === '' || fiscalKey === '' || fiscalNumber === '') {
          Notification({
            type: 'error',
            title: 'Erro',
            description: 'Nenhum campo pode ser vazio',
          });
          setLoading(false);
          return;
        }
        let data = {
          description: description,
          fiscal_key: fiscalKey,
          fiscal_number: fiscalNumber,
        };
        setLoading(true);
        let response = await api.post('/warehouse/receipt', data);
        setLoading(false);
        let rawMaterialData = { raw_materials: rawMaterialsAdded };

        await api.post(
          `/warehouse/receipt/${response.data.id}`,
          rawMaterialData
        );

        const newReceivementRegistered = response.data;
        receivements.push(newReceivementRegistered);

        setLoading(false);
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Recebimento feito com sucesso',
        });
        handleClose();
      } catch (error) {
        console.error(error);
        setLoading(false);
        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível efetuar o recebimento',
        });
      }
    }
  }

  async function handleClose() {
    setRawMaterialsAdded([
      {
        id: '',
        quantity: '',
        grade_value: 0,
        unitary_value: '',
        rawMaterialName: '',
        coefficient: 0,
      },
    ]);
    setId('');
    setDescription('');
    setFiscalNumber('');
    setFiscalKey('');
    setIsLockInsChange(false);
    setIsModalOpen(false);
    setLoading(false);
  }

  function addNewReceivement() {
    const newArray = [
      ...rawMaterialsAdded,
      {
        id: '',
        quantity: '',
        grade_value: 0,
        unitary_value: '',
        rawMaterialName: '',
        coefficient: 0,
      },
    ];
    setRawMaterialsAdded(newArray);
  }

  function removeReceivement(indexOfItem: number) {
    let newArray = [...rawMaterialsAdded];
    newArray.splice(indexOfItem, 1);
    setRawMaterialsAdded(newArray);
  }

  function handleChangeRawMaterial(value, index: number) {
    let newArray = [...rawMaterialsAdded];

    newArray[index].id = value[0];
    newArray[
      index
    ].rawMaterialName = `${value[3]} | ${value[1]} / (${value[2]})`;
    newArray[index].coefficient = value[4];

    setRawMaterialsAdded(newArray);
  }

  function handleChangeUnitaryValue(value, coefficient, index) {
    let newArray = [...rawMaterialsAdded];

    newArray[index].unitary_value = value;
    newArray[index].grade_value =
      parseFloat(value) * parseFloat(newArray[index].quantity) * coefficient;

    setRawMaterialsAdded(newArray);
  }

  function handleChangeQuantity(value, index) {
    let newArray = [...rawMaterialsAdded];
    newArray[index].quantity = value;

    setRawMaterialsAdded(newArray);
  }

  function handleChangeGradeValue(value, index) {
    let newArray = [...rawMaterialsAdded];

    newArray[index].grade_value = value;
    newArray[index].grade_value =
      parseFloat(value) * parseFloat(newArray[index].quantity);
  }

  function handleEdit(data) {
    setId(data.id);
    setDescription(data.description);
    setFiscalNumber(data.fiscal_number);
    setFiscalKey(data.fiscal_key);

    setIsLockInsChange(true);
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
          title: 'Descrição',
          dataIndex: 'description',
          key: 'description',
          width: '30%',
          ...this.getColumnSearchProps('description'),
          sorter: (a, b) => a.description.length - b.description.length,
        },
        {
          title: 'Número da Nota',
          dataIndex: 'fiscal_number',
          key: 'fiscal_number',
          width: '30%',
          ...this.getColumnSearchProps('fiscal_number'),
          sorter: (a, b) => a.fiscal_number.length - b.fiscal_number.length,
        },
        {
          title: 'Chave da Nota',
          dataIndex: 'fiscal_key',
          key: 'fiscal_key',
          width: '30%',
          ...this.getColumnSearchProps('fiscal_key'),
          sorter: (a, b) => a.fiscal_key.length - b.fiscal_key.length,
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
              </>
            );
          },
        },
      ];
      return <Table columns={columns} dataSource={receivements} />;
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
              Cadastrar Recebimento
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>
      <Modal
        width={800}
        title="Cadastro de Entradas"
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
          <Col span={8}>
            <Form.Item
              key="receivedNameFormItem"
              labelCol={{ span: 23 }}
              label="Nome da Entrada"
              labelAlign={'left'}
              style={{ backgroundColor: 'white', fontWeight: 'bold' }}
              required
            >
              <Input
                key="receivedName"
                size="large"
                placeholder="Digite o código INS, ex: "
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
                placeholder="Ex: EUCATEX 21/04/21"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              key="fiscalNumberFormItem"
              labelCol={{ span: 23 }}
              label="Número da NF-e:"
              labelAlign={'left'}
              style={{ backgroundColor: 'white', fontWeight: 'bold' }}
              required
            >
              <Input
                key="fiscalNumber"
                size="large"
                placeholder=""
                value={fiscalNumber}
                onChange={(e) => {
                  setFiscalNumber(e.target.value);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              key="fiscalNumberFormItem"
              labelCol={{ span: 23 }}
              label="Chave da Nota:"
              labelAlign={'left'}
              style={{ backgroundColor: 'white', fontWeight: 'bold' }}
              required
            >
              <Input
                key="fiscalKey"
                size="large"
                placeholder=""
                value={fiscalKey}
                onChange={(e) => {
                  setFiscalKey(e.target.value);
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Divider />
        {rawMaterialsAdded.map((itens, index) => (
          <>
            <Row gutter={24}>
              <Col span={17}>
                <Form.Item
                  key="formItemRawMaterials"
                  labelCol={{ span: 23 }}
                  label="Insumo: "
                  labelAlign={'left'}
                  style={{ backgroundColor: 'white', fontWeight: 'bold' }}
                  required
                >
                  <Select
                    showSearch
                    size="large"
                    style={{ width: '140%', marginBottom: '10px' }}
                    placeholder="Selecion o insumo"
                    optionFilterProp="children"
                    value={itens.rawMaterialName}
                    disabled={isLockInsChange}
                    onChange={(e) => {
                      handleChangeRawMaterial(e, index);
                    }}
                  >
                    {rawMaterials.map((item) => (
                      <>
                        <Option
                          key={item.id}
                          value={[
                            item.id,
                            item.name,
                            item.unit_measurement_name,
                            item.code,
                            item.coefficient,
                          ]}
                        >
                          {`${item.code} |
                            ${item.name} / 
                            (${item.unit_measurement_name})`}
                        </Option>
                      </>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={5}>
                <Form.Item
                  key="formQuantity"
                  labelCol={{ span: 23 }}
                  label="Quantidade: "
                  labelAlign={'left'}
                  style={{
                    backgroundColor: 'white',
                    fontWeight: 'bold',
                    marginRight: '5%',
                  }}
                  required
                >
                  <Input
                    type="number"
                    key="quantiyKey"
                    size="large"
                    value={itens.quantity}
                    disabled={itens.rawMaterialName != '' ? false : true}
                    onChange={(e) => {
                      handleChangeQuantity(e.target.value, index);
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  key="formUnitaryValue"
                  labelCol={{ span: 28 }}
                  label="Valor Unitário do Insumo: "
                  labelAlign={'left'}
                  style={{
                    backgroundColor: 'white',
                    fontWeight: 'bold',
                    marginRight: '5%',
                  }}
                >
                  <Input
                    type="number"
                    key="unitaryValue"
                    size="large"
                    disabled={itens.quantity != '' ? false : true}
                    value={itens.unitary_value}
                    onChange={(e) => {
                      handleChangeUnitaryValue(
                        e.target.value,
                        itens.coefficient,
                        index
                      );
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  key="formTotal"
                  labelCol={{ span: 23 }}
                  label="Total: "
                  labelAlign={'left'}
                  style={{
                    backgroundColor: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  <Input
                    type="number"
                    key="totalKey"
                    size="large"
                    placeholder="0"
                    disabled={true}
                    value={itens.grade_value}
                    style={{ width: '80%', marginRight: '5%' }}
                  />
                  {rawMaterialsAdded.length != 1 && (
                    <MinusCircleOutlined
                      style={{ color: 'red' }}
                      onClick={() => removeReceivement(index)}
                    />
                  )}
                </Form.Item>
              </Col>
              <Divider />
            </Row>
            <Row>
              <Col span={24}>
                {rawMaterialsAdded.length - 1 === index && (
                  <Button
                    key="primary"
                    title="Novo insumo"
                    style={{
                      width: '100%',
                      color: 'white',
                      backgroundColor: 'rgb(5, 155, 50)',
                    }}
                    disabled={itens.unitary_value != '' ? false : true}
                    onClick={addNewReceivement}
                  >
                    <PlusOutlined />
                    Adicionar insumo
                  </Button>
                )}
              </Col>
            </Row>
          </>
        ))}
      </Modal>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  try {
    const rawMaterialResponse = await apiClient.get('/warehouse/raw-material');
    const receivementResponse = await apiClient.get('/warehouse/receipt');

    const rawMaterialData = rawMaterialResponse.data;
    const receivementData = receivementResponse.data;

    return {
      props: {
        rawMaterial: rawMaterialData,
        receivement: receivementData,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        rawMaterial: [{}],
      },
    };
  }
};
