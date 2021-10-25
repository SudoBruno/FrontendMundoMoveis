import React, { FormEvent, useState } from 'react';
import { ColorPicker, useColor } from 'react-color-palette';
import 'react-color-palette/lib/css/styles.css';
import {
  Button,
  Col,
  Form,
  Input,
  Select,
  Modal,
  Row,
  Popover,
  Table,
  Popconfirm,
  Space,
  Layout,
  Tag,
  Steps,
  Divider,
  DatePicker,
} from 'antd';
import next, { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Notification } from '../../../components/Notification';
import { getAPIClient } from '../../../services/axios';
import Highlighter from 'react-highlight-words';
import styles from '../../../styles/app.module.scss';
import '../../../styles/app.module.scss';
import { api } from '../../../services/api';
import {
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons/lib/icons/';
import localStyles from './styles.module.scss';
import MinusCircleOutlined from '@ant-design/icons/lib/icons/MinusCircleOutlined';
import TextArea from 'antd/lib/input/TextArea';
import moment from 'moment';

const { Option } = Select;
const { Step } = Steps;

interface ISolicitation {
  id: string;
  description: string;
}

interface IProps {
  solicitations: ISolicitation[];
}

export default function Approve({
  solicitations,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [solicitation, setSolicitation] =
    useState<ISolicitation[]>(solicitations);
  const [current, setCurrent] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [description, setDescription] = useState<string>('');
  const [products, setProducts] = useState([]);
  const [budget, setBudget] = useState([
    {
      id: '',
      provider: '',
      seller: '',
      observation: '',
      financial_solicitation_id: '',
      payment_type_id: '',
      installments: 0,
      due_date: '',
      freight: 0,
    },
  ]);

  async function handleChangeSolicitation(data) {
    try {
      setIsOpenModal(true);
      setDescription(data.description);

      const response = await api.get(`/financial/budget/${data.id}`);
      setBudget(response.data);

      changeProductsOfBudgets(response.data[0].id);
    } catch (error) {
      console.log(error);
    }
  }

  async function changeProductsOfBudgets(budgetId: string) {
    try {
      const productsResponse = await api.get(
        `/financial/budget/product/${budgetId}`
      );

      setProducts(productsResponse.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function approveBudget(current: number, is_approved: boolean) {
    try {
      const budgetId = budget[current].id;
      const financialSolicitationId = budget[current].financial_solicitation_id;
      console.log(budget[current].financial_solicitation_id);

      console.log('budgetId: ' + budgetId);
      console.log('Financial: ', financialSolicitationId);

      const response = await api.put(
        `/financial/solicitation/approve/${financialSolicitationId}`,
        {
          budget_id: budgetId,
          is_approved,
        }
      );

      handleClose();
      Notification({
        type: 'success',
        title: 'Sucesso',
        description: 'Solicitação Aprovada',
      });
    } catch (error) {
      console.log(error.response);
      Notification({
        type: 'error',
        title: 'Erro',
        description: `${error.response.data.message}`,
      });
    }
  }

  function handleClose() {
    setIsOpenModal(false);
  }

  const next = () => {
    setCurrent(current + 1);
    setLoading(true);
    changeProductsOfBudgets(budget[current + 1].id);
    setLoading(false);
  };

  const prev = () => {
    setCurrent(current - 1);
    changeProductsOfBudgets(budget[current - 1].id);
    setLoading(false);
  };

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
          title: 'Nome',
          dataIndex: 'user_name',
          key: 'user_name',
          width: '20%',
          ...this.getColumnSearchProps('user_name'),
          sorter: (a, b) => a.user_name.length - b.user_name.length,
        },
        {
          title: 'Descrição',
          dataIndex: 'description',
          key: 'description',
          width: '80%',
          ...this.getColumnSearchProps('description'),
          sorter: (a, b) => a.description.length - b.description.length,
        },
        {
          title: 'Visualizar',
          key: 'situation',
          width: '30%',
          render: (record, index) => {
            return (
              <>
                <Button
                  className={styles.button}
                  style={{
                    borderRadius: '26px',
                    marginTop: '10px',
                    marginLeft: '10px',
                    borderColor: '#1c3030',
                    color: '#1c3030',
                    backgroundColor: 'white',
                  }}
                  onClick={() => {
                    handleChangeSolicitation(record);
                  }}
                >
                  <EyeOutlined />
                </Button>
              </>
            );
          },
        },
      ];
      return <Table columns={columns} dataSource={solicitation} />;
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
              onClick={() => setIsOpenModal(true)}
            >
              Nova Solicitação
            </Button>
          </Col>
        </Row>
        <SearchTable />
        <Modal
          title="Solicitação"
          width={900}
          visible={isOpenModal}
          onCancel={() => {
            handleClose();
          }}
          footer={[]}
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
                <Row gutter={5} align={'middle'}>
                  <Col span={19}>
                    <Form.Item
                      key="descriptionFormItem"
                      labelCol={{ span: 20 }}
                      label="Descrição:"
                      labelAlign={'left'}
                      style={{
                        backgroundColor: 'white',
                      }}
                      required
                    >
                      <Input
                        key="nameKey"
                        size="large"
                        placeholder="Ex: Compra de Teclados..."
                        value={description}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Steps current={current}>
                  {[1, 2, 3].map((item) => (
                    <Step key={item} title={item} />
                  ))}
                </Steps>

                <div className={localStyles.stepsContent}>
                  <>
                    <Row gutter={5} align={'middle'}>
                      <Col span={10}>
                        <Form.Item
                          key="ProviderFormItem"
                          labelCol={{ span: 20 }}
                          label="Fornecedor(a):"
                          labelAlign={'left'}
                          style={{
                            backgroundColor: 'white',
                          }}
                          required
                        >
                          <Input
                            key="nameKey"
                            size="large"
                            placeholder="Ex: Mercado Livre, Pontofrio..."
                            value={budget[current].provider}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={10}>
                        <Form.Item
                          key="sellerFormItem"
                          labelCol={{ span: 20 }}
                          label="Vendedor(a):"
                          labelAlign={'left'}
                          style={{
                            backgroundColor: 'white',
                          }}
                          required
                        >
                          <Input
                            key="nameKey"
                            size="large"
                            placeholder="Ex: Francisca, André, Gilberto..."
                            value={budget[current].seller}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={10}>
                        <Form.Item
                          key="PaymentTypeFormItem"
                          labelCol={{ span: 23 }}
                          label="Selecione o tipo de pagamento"
                          labelAlign={'left'}
                          style={{
                            backgroundColor: 'white',
                          }}
                          required
                        >
                          <Select
                            value={budget[current].payment_type_id}
                          ></Select>
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          key="freightFormItem"
                          labelCol={{ span: 20 }}
                          label="Qtd Parcelas"
                          labelAlign={'left'}
                          style={{
                            backgroundColor: 'white',
                          }}
                          required
                        >
                          <Input
                            key="nameKey"
                            defaultValue={0}
                            placeholder=""
                            value={budget[current].installments}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={5}>
                        <Form.Item
                          key="freightFormItem"
                          labelCol={{ span: 20 }}
                          label="Valor do Frete"
                          labelAlign={'left'}
                          style={{
                            backgroundColor: 'white',
                          }}
                          required
                        >
                          <Input
                            key="nameKey"
                            defaultValue={0}
                            placeholder=""
                            value={budget[current].freight}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          key="sellerFormItem"
                          labelCol={{ span: 20 }}
                          label="Data de Vencimento:"
                          labelAlign={'left'}
                          style={{
                            backgroundColor: 'white',
                          }}
                          required
                        >
                          <DatePicker
                            format="DD/MM/YYYY"
                            value={moment(budget[current].due_date)}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={10}>
                        <Form.Item
                          key="observationFormItem"
                          labelCol={{ span: 20 }}
                          label="Observações"
                          labelAlign={'left'}
                          style={{
                            backgroundColor: 'white',
                          }}
                        >
                          <TextArea
                            key="nameKey"
                            size="large"
                            value={budget[current].observation}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Divider />
                    <h2>Produtos</h2>
                    {products.map((selectedIten, index) => (
                      <>
                        <Row gutter={5}>
                          <Col span={10}>
                            <Form.Item
                              key="requesterItem"
                              labelCol={{ span: 23 }}
                              label="Solicitante"
                              labelAlign={'left'}
                              style={{ backgroundColor: 'white' }}
                            >
                              <Input
                                key="requesterName"
                                size="large"
                                placeholder="EX: José Dirceu da Silva"
                                value={selectedIten.requester}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              key="utilizationFormItem"
                              labelCol={{ span: 23 }}
                              label="Utilização"
                              labelAlign={'left'}
                              style={{ backgroundColor: 'white' }}
                            >
                              <Input
                                key="utilization"
                                size="large"
                                placeholder="EX: Escritorio, Almoxarifado"
                                value={selectedIten.utilization}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={5}>
                          <Col span={20}>
                            <Form.Item
                              key="productNameFormItem"
                              labelCol={{ span: 23 }}
                              label="Nome"
                              labelAlign={'left'}
                              style={{ backgroundColor: 'white' }}
                            >
                              <Input
                                key="productName"
                                size="large"
                                placeholder="Ex: Notebook I5 8gb"
                                value={selectedIten.name}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={5}>
                          <Col span={6}>
                            <Form.Item
                              key="unitaryValueFormItem"
                              labelCol={{ span: 23 }}
                              label="Valor Unitário"
                              labelAlign={'left'}
                              style={{ backgroundColor: 'white' }}
                            >
                              <Input
                                type="number"
                                key="unitaryValue"
                                size="large"
                                placeholder=""
                                value={selectedIten.unitary_value}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              key="quantityFormItem"
                              labelCol={{ span: 23 }}
                              label="Quantidade"
                              labelAlign={'left'}
                              style={{ backgroundColor: 'white' }}
                            >
                              <Input
                                type="number"
                                key="Quantity"
                                size="large"
                                placeholder=""
                                value={selectedIten.quantity}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              key="totalValueFormItem"
                              labelCol={{ span: 23 }}
                              label="Valor Total"
                              labelAlign={'left'}
                              style={{ backgroundColor: 'white' }}
                            >
                              <Input
                                disabled={true}
                                type="number"
                                key="total"
                                size="large"
                                placeholder=""
                                value={selectedIten.total_value}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={5}>
                          <Col span={6}>
                            <Form.Item
                              key="unitFormItem"
                              labelCol={{ span: 23 }}
                              label="Unidade de medida"
                              labelAlign={'left'}
                              style={{ backgroundColor: 'white' }}
                            >
                              <Input
                                key="unitName"
                                size="large"
                                placeholder="EX: Pç, unidade"
                                value={selectedIten.unit_of_measurement}
                                style={{ width: '85%', marginRight: '5%' }}
                              />

                              <Divider />
                            </Form.Item>
                          </Col>
                        </Row>
                      </>
                    ))}
                  </>
                </div>

                <div className={localStyles.stepsAction}>
                  {current < budget.length - 1 && (
                    <Button
                      type="primary"
                      onClick={(e) => next()}
                      loading={loading}
                    >
                      Next
                    </Button>
                  )}
                  {current === budget.length - 1 && (
                    <Button
                      type="primary"
                      onClick={(e) => {
                        console.log('e');
                      }}
                    >
                      Done
                    </Button>
                  )}
                  {current > 0 && (
                    <Button
                      style={{ margin: '0 8px' }}
                      loading={loading}
                      onClick={() => prev()}
                    >
                      Previous
                    </Button>
                  )}

                  <Button
                    className={styles.button_approve}
                    style={{ marginLeft: '29.3rem' }}
                    onClick={(e) => approveBudget(current, true)}
                    loading={loading}
                  >
                    Aprovar
                  </Button>
                  <Button
                    className={styles.button_reprove}
                    style={{ marginLeft: '10px' }}
                    onClick={(e) => approveBudget(current, false)}
                    loading={loading}
                  >
                    Reprovar
                  </Button>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Modal>
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  try {
    const solicitation = await apiClient.get(
      '/financial/solicitation/to-approve'
    );

    return {
      props: {
        solicitations: solicitation.data,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        solicitations: [],
      },
    };
  }
};
