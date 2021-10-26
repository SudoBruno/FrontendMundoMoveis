import PlusOutlined from '@ant-design/icons/lib/icons/PlusOutlined';
import {
  Modal,
  Button,
  Row,
  Col,
  Form,
  Input,
  Layout,
  Steps,
  message,
  Select,
  Tag,
  DatePicker,
  Space,
  Divider,
  Table,
} from 'antd';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import React, { FormEvent, useState } from 'react';
import styles from '../../../styles/app.module.scss';
import localStyles from './styles.module.scss';
import { getAPIClient } from '../../../services/axios';
import SolicitationType from '../SolicitationType/index';
import CenterCost from '../CostCenter/index';
import { api } from '../../../services/api';
import TextArea from 'antd/lib/input/TextArea';
import MinusCircleOutlined from '@ant-design/icons/lib/icons/MinusCircleOutlined';
import Highlighter from 'react-highlight-words';
import SearchOutlined from '@ant-design/icons/lib/icons/SearchOutlined';
import moment from 'moment';
import PaymentType from '../PaymentType/index';

const { Option } = Select;
const { Step } = Steps;

interface ISolicitationType {
  id: string;
  name: string;
  color: any;
}

interface IAccountPlan {
  id: string;
  name: string;
}

interface ICostCenter {
  id: string;
  name: string;
}

interface IPaymentType {
  id: string;
  name: string;
}

interface ISolicitation {
  id: string;
  description: string;
}

interface IProps {
  solicitationTypes: ISolicitationType[];
  accountPlans: IAccountPlan[];
  costCenters: ICostCenter[];
  paymentTypes: IPaymentType[];
  solicitations: ISolicitation[];
}

export default function Solicitation({
  solicitationTypes,
  accountPlans,
  costCenters,
  paymentTypes,
  solicitations,
}: IProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpenModal, setIsModalOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [solicitation, setSolicitation] =
    useState<ISolicitation[]>(solicitations);
  const [solicitationId, setSolicitationId] = useState('');
  const [description, setDescription] = useState<string>('');
  const [accountPlan, setAccountPlan] = useState<IAccountPlan[]>(accountPlans);
  const [paymentType, setPaymentType] = useState<IPaymentType[]>(paymentTypes);
  const [solicitationType, setSolicitationType] =
    useState<ISolicitationType[]>(solicitationTypes);
  const [costCenter, setCenterCost] = useState<ICostCenter[]>(costCenters);
  const [costCentersAdded, setCostCentersAdded] = useState<any>([]);
  const [solicitationTypeId, setSolicitationTypeId] = useState<string>('');
  const [accountPlanId, setAccountPlanId] = useState<string>('');
  const [paymentTypeId, setPaymentTypeId] = useState<string>('');
  const [budgetId, setBudgetId] = useState<string>('');
  const [budgetObservation, setBudgetObservation] = useState<string>('');
  const [budgetProvider, setBudgetProvider] = useState<string>('');
  const [budgetSeller, setBudgetSeller] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [freight, setFreight] = useState<number>();
  const [installments, setInstallments] = useState<number>(1);
  const [situationDescription, setSituationDescription] = useState<string>('');
  const [productsAdded, setProductsAdded] = useState<any[]>([
    {
      name: '',
      unit_of_measurement: '',
      utilization: '',
      requester: '',
      unitary_value: '',
      quantity: '',
      total_value: '',
    },
  ]);

  function handleAddCenterCost(value) {
    setCostCentersAdded(value);
    console.log(costCentersAdded);
  }

  async function handleCreateSolicitation(e: FormEvent) {
    e.preventDefault();
    try {
      const data = {
        description: description,
        solicitation_type_id: solicitationTypeId,
      };

      setLoading(true);
      const solicitationIdResponse = await api.post(
        '/financial/solicitation',
        data
      );

      setSolicitationId(solicitationIdResponse.data.id);

      const solicitationAccountPlanId = await api.post(
        `/financial/solicitation/${solicitationIdResponse.data.id}`,
        {
          financial_account_plan_id: accountPlanId,
        }
      );

      await api.post(
        `/financial/solicitation/account-plan/${solicitationAccountPlanId.data.id}`,
        { financial_cost_centers: costCentersAdded }
      );

      message.success('Tudo OK. Prosseguindo...');

      setLoading(false);
      next();
    } catch (error) {
      console.error(error.response);
      message.error('Etapa não concluida');
      setLoading(false);
    }
  }

  async function handleCreateBudget(e: FormEvent) {
    e.preventDefault();
    try {
      const data = {
        observation: budgetObservation,
        provider: budgetProvider,
        seller: budgetSeller,
        payment_type_id: paymentTypeId,
        financial_solicitation_id: solicitationId,
        due_date: dueDate,
        freight: freight,
        installments: installments,
      };

      setLoading(true);
      const budgetIdResponse = await api.post('/financial/budget', data);

      const response = await api.post('/financial/budget/product', {
        budget_id: budgetIdResponse.data.id,
        products: productsAdded,
      });

      await api.post(`/financial/solicitation/status/${solicitationId}`);
      message.success('Tudo OK. Prosseguindo...');
      setLoading(false);
      closeModal(current);
    } catch (error) {
      console.error(error.response);
      message.error('Etapa não concluida');
      setLoading(false);
    }
  }

  const closeModal = (current) => {
    if (current === steps.length - 1) {
      setIsModalOpen(false);
      handleClose();
    } else {
      next();
    }
  };

  function addNewProduct() {
    const newArray = [
      ...productsAdded,
      {
        name: '',
        unit_of_measurement: '',
        utilization: '',
        requester: '',
        unitary_value: '',
        quantity: '',
        total_value: '',
      },
    ];
    setProductsAdded(newArray);
  }

  function handleChangeProductName(value, index) {
    let newArray = [...productsAdded];

    newArray[index].name = value;

    setProductsAdded(newArray);
  }

  function handleChangeUnit(value, index) {
    let newArray = [...productsAdded];

    newArray[index].unit_of_measurement = value;

    setProductsAdded(newArray);
  }

  function handleChangeUnitaryValue(value, index) {
    let newArray = [...productsAdded];

    newArray[index].unitary_value = Number(value);
    newArray[index].total_value =
      Number(value) * Number(newArray[index].quantity);

    setProductsAdded(newArray);
  }

  function handleChangeQuantity(value, index) {
    let newArray = [...productsAdded];

    newArray[index].quantity = Number(value);
    newArray[index].total_value =
      Number(value) * Number(newArray[index].unitary_value);

    console.log(newArray);

    setProductsAdded(newArray);
  }

  function handleChangeUtilization(value, index) {
    let newArray = [...productsAdded];

    newArray[index].utilization = value;

    setProductsAdded(newArray);
  }

  function handleChangeRequester(value, index) {
    let newArray = [...productsAdded];

    newArray[index].requester = value;

    setProductsAdded(newArray);
  }

  function removeProduct(indexOfItem: number) {
    let newArray = [...productsAdded];
    newArray.splice(indexOfItem, 1);
    setProductsAdded(newArray);
  }

  function FunctionIsAproved() {
    setSituationDescription('APROVADO');
    return 'green';
  }

  function FunctionNotAprovedOrOnHold() {
    return 'green';
  }

  const steps = [
    {
      title: 'Solicitação',
      content: (
        <>
          {' '}
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
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={5} align={'middle'}>
            <Col span={8}>
              <Form.Item
                key="solicitationTypeFormItem"
                labelCol={{ span: 23 }}
                label="Tipo de Solicitação:"
                labelAlign={'left'}
                style={{
                  backgroundColor: 'white',
                }}
                required
              >
                <Select
                  key="managerName"
                  value={solicitationTypeId}
                  onChange={(e) => {
                    setSolicitationTypeId(e.toString());
                  }}
                >
                  {solicitationType.map((item) => (
                    <>
                      <Option key={item.id} value={item.id}>
                        <Tag color={item.color} key={item.color}>
                          ⠀⠀⠀⠀⠀⠀⠀
                        </Tag>
                        {item.name}
                      </Option>
                    </>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={9}>
              <Form.Item
                key="AccountFormItem"
                labelCol={{ span: 23 }}
                label="Selecione o Plano de Conta"
                labelAlign={'left'}
                style={{
                  backgroundColor: 'white',
                }}
                required
              >
                <Select
                  key="managerName"
                  value={accountPlanId}
                  onChange={(e) => {
                    setAccountPlanId(e.toString());
                  }}
                >
                  {accountPlan.map((item) => (
                    <>
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    </>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={15}>
              <Form.Item
                key="CenterCostFormItem"
                labelCol={{ span: 23 }}
                label="Selecione o(s) centro(s) de custo"
                labelAlign={'left'}
                style={{
                  backgroundColor: 'white',
                }}
                required
              >
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: '100%' }}
                  onChange={(e) => handleAddCenterCost(e)}
                >
                  {costCenter.map((item) => (
                    <>
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    </>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      title: 'Orçamento 1',
      content: (
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
                  value={budgetProvider}
                  onChange={(e) => {
                    setBudgetProvider(e.target.value);
                  }}
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
                  value={budgetSeller}
                  onChange={(e) => {
                    setBudgetSeller(e.target.value);
                  }}
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
                  value={paymentTypeId}
                  onChange={(e) => setPaymentTypeId(e.toString())}
                >
                  {paymentType.map((item) => (
                    <>
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    </>
                  ))}
                </Select>
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
                  value={installments}
                  onChange={(e) => {
                    setInstallments(Number(e.target.value));
                  }}
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
                  value={freight}
                  onChange={(e) => {
                    setFreight(Number(e.target.value));
                  }}
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
                  onChange={(e) => {
                    setDueDate(e);
                  }}
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
                  value={budgetObservation}
                  onChange={(e) => {
                    setBudgetObservation(e.target.value);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <h2>Produtos</h2>
          {productsAdded.map((selectedIten, index) => (
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
                      onChange={(e) => {
                        handleChangeRequester(e.target.value, index);
                      }}
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
                      onChange={(e) => {
                        handleChangeUtilization(e.target.value, index);
                      }}
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
                      onChange={(e) => {
                        handleChangeProductName(e.target.value, index);
                      }}
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
                      onChange={(e) => {
                        handleChangeUnitaryValue(e.target.value, index);
                      }}
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
                      onChange={(e) => {
                        handleChangeQuantity(e.target.value, index);
                      }}
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
                      onChange={(e) => {
                        handleChangeUnit(e.target.value, index);
                      }}
                    />
                    {productsAdded.length != 1 && (
                      <MinusCircleOutlined
                        style={{ color: 'red' }}
                        onClick={() => removeProduct(index)}
                      />
                    )}
                    <Divider />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  {productsAdded.length - 1 === index && (
                    <Button
                      key="primary"
                      title="Novo insumo"
                      style={{
                        width: '100%',
                        color: 'white',
                        backgroundColor: 'rgb(5, 155, 50)',
                      }}
                      onClick={addNewProduct}
                    >
                      <PlusOutlined />
                      Adicionar Produto
                    </Button>
                  )}
                </Col>
              </Row>
            </>
          ))}
        </>
      ),
    },
    {
      title: 'Orçamento 2',
      content: (
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
                  value={budgetProvider}
                  onChange={(e) => {
                    setBudgetProvider(e.target.value);
                  }}
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
                  value={budgetSeller}
                  onChange={(e) => {
                    setBudgetSeller(e.target.value);
                  }}
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
                  value={paymentTypeId}
                  onChange={(e) => setPaymentTypeId(e.toString())}
                >
                  {paymentType.map((item) => (
                    <>
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    </>
                  ))}
                </Select>
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
                  value={installments}
                  onChange={(e) => {
                    setInstallments(Number(e.target.value));
                  }}
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
                  value={freight}
                  onChange={(e) => {
                    setFreight(Number(e.target.value));
                  }}
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
                  onChange={(e) => {
                    setDueDate(e);
                  }}
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
                  value={budgetObservation}
                  onChange={(e) => {
                    setBudgetObservation(e.target.value);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <h2>Produtos</h2>
          {productsAdded.map((selectedIten, index) => (
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
                      onChange={(e) => {
                        handleChangeRequester(e.target.value, index);
                      }}
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
                      onChange={(e) => {
                        handleChangeUtilization(e.target.value, index);
                      }}
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
                      onChange={(e) => {
                        handleChangeProductName(e.target.value, index);
                      }}
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
                      onChange={(e) => {
                        handleChangeUnitaryValue(e.target.value, index);
                      }}
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
                      onChange={(e) => {
                        handleChangeQuantity(e.target.value, index);
                      }}
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
                      onChange={(e) => {
                        handleChangeUnit(e.target.value, index);
                      }}
                    />
                    {productsAdded.length != 1 && (
                      <MinusCircleOutlined
                        style={{ color: 'red' }}
                        onClick={() => removeProduct(index)}
                      />
                    )}
                    <Divider />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  {productsAdded.length - 1 === index && (
                    <Button
                      key="primary"
                      title="Novo insumo"
                      style={{
                        width: '100%',
                        color: 'white',
                        backgroundColor: 'rgb(5, 155, 50)',
                      }}
                      onClick={addNewProduct}
                    >
                      <PlusOutlined />
                      Adicionar Produto
                    </Button>
                  )}
                </Col>
              </Row>
            </>
          ))}
        </>
      ),
    },
    {
      title: 'Orçamento 3',
      content: (
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
                  value={budgetProvider}
                  onChange={(e) => {
                    setBudgetProvider(e.target.value);
                  }}
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
                  value={budgetSeller}
                  onChange={(e) => {
                    setBudgetSeller(e.target.value);
                  }}
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
                  value={paymentTypeId}
                  onChange={(e) => setPaymentTypeId(e.toString())}
                >
                  {paymentType.map((item) => (
                    <>
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    </>
                  ))}
                </Select>
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
                  value={installments}
                  onChange={(e) => {
                    setInstallments(Number(e.target.value));
                  }}
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
                  value={freight}
                  onChange={(e) => {
                    setFreight(Number(e.target.value));
                  }}
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
                  onChange={(e) => {
                    setDueDate(e);
                  }}
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
                  value={budgetObservation}
                  onChange={(e) => {
                    setBudgetObservation(e.target.value);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <h2>Produtos</h2>
          {productsAdded.map((selectedIten, index) => (
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
                      onChange={(e) => {
                        handleChangeRequester(e.target.value, index);
                      }}
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
                      onChange={(e) => {
                        handleChangeUtilization(e.target.value, index);
                      }}
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
                      onChange={(e) => {
                        handleChangeProductName(e.target.value, index);
                      }}
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
                      onChange={(e) => {
                        handleChangeUnitaryValue(e.target.value, index);
                      }}
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
                      onChange={(e) => {
                        handleChangeQuantity(e.target.value, index);
                      }}
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
                      onChange={(e) => {
                        handleChangeUnit(e.target.value, index);
                      }}
                    />
                    {productsAdded.length != 1 && (
                      <MinusCircleOutlined
                        style={{ color: 'red' }}
                        onClick={() => removeProduct(index)}
                      />
                    )}
                    <Divider />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  {productsAdded.length - 1 === index && (
                    <Button
                      key="primary"
                      title="Novo insumo"
                      style={{
                        width: '100%',
                        color: 'white',
                        backgroundColor: 'rgb(5, 155, 50)',
                      }}
                      onClick={addNewProduct}
                    >
                      <PlusOutlined />
                      Adicionar Produto
                    </Button>
                  )}
                </Col>
              </Row>
            </>
          ))}
        </>
      ),
    },
  ];

  const next = () => {
    setCurrent(current + 1);
    setBudgetSeller('');
    setBudgetProvider('');
    setPaymentTypeId('');
    setBudgetObservation('');
    setInstallments(1);
    setFreight(0);
  };

  const prev = () => {
    setCurrent(current - 1);
    setLoading(false);
  };

  async function handleClose() {
    setIsModalOpen(false);
    setCurrent(0);
    setDescription('');
    setSolicitationTypeId('');
    setAccountPlanId('');
    setProductsAdded([
      {
        name: '',
        unit_of_measurement: '',
        utilization: '',
        requester: '',
        unitary_value: '',
        quantity: '',
        total_value: '',
      },
    ]);
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
          title: 'Gerente',
          key: 'situation',
          width: '30%',
          render: (record, index) => {
            return (
              <>
                {record.status_manager && (
                  <Tag color={'green'} key={record.id}>
                    Aprovado
                  </Tag>
                )}
                {record.status_manager === null && (
                  <Tag color={'yellow'} key={record.id}>
                    Em Análise
                  </Tag>
                )}
                {record.status_manager === 0 && (
                  <Tag color={'green'} key={record.id}>
                    Reprovado
                  </Tag>
                )}
              </>
            );
          },
        },
        {
          title: 'Autoridade competente',
          key: 'situation',
          width: '30%',
          render: (record, index) => {
            return (
              <>
                {record.status_competent_authority && (
                  <Tag color={'green'} key={record.id}>
                    Aprovado
                  </Tag>
                )}
                {record.status_competent_authority === null && (
                  <Tag color={'yellow'} key={record.id}>
                    Em Análise
                  </Tag>
                )}
                {record.status_competent_authority === 0 && (
                  <Tag color={'green'} key={record.id}>
                    Reprovado
                  </Tag>
                )}
              </>
            );
          },
        },
        {
          title: 'Diretor',
          key: 'situation',
          width: '30%',
          render: (record, index) => {
            return (
              <>
                {
                  record.status_director !== undefined ? (
                    <>
                      {record.status_director && (
                        <Tag color={'green'} key={record.id}>
                          Aprovado
                        </Tag>
                      )}
                      {record.status_director === null && (
                        <Tag color={'yellow'} key={record.id}>
                          Em Análise
                        </Tag>
                      )}
                      {record.status_director === 0 && (
                        <Tag color={'green'} key={record.id}>
                          Reprovado
                        </Tag>
                      )}
                    </>
                  ) : (
                    <Tag color={'gray'} key={record.id}>
                      sem necessidade
                    </Tag>)}
              </>

            );
          },
        },
        {
          title: 'Financeiro',
          key: 'situation',
          width: '30%',
          render: (record, index) => {
            return (
              <>
                {record.status_financial && (
                  <Tag color={'green'} key={record.id}>
                    Aprovado
                  </Tag>
                )}
                {record.status_financial === null && (
                  <Tag color={'yellow'} key={record.id}>
                    Em Análise
                  </Tag>
                )}
                {record.status_financial === 0 && (
                  <Tag color={'green'} key={record.id}>
                    Reprovado
                  </Tag>
                )}
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
              onClick={() => setIsModalOpen(true)}
            >
              Nova Solicitação
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>
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
              <Steps current={current}>
                {steps.map((item) => (
                  <Step key={item.title} title={item.title} />
                ))}
              </Steps>
              <div className={localStyles.stepsContent}>
                {steps[current].content}
              </div>
              <div className={localStyles.stepsAction}>
                {current < steps.length - 1 && (
                  <Button
                    type="primary"
                    onClick={(e) =>
                      current === 0
                        ? handleCreateSolicitation(e)
                        : handleCreateBudget(e)
                    }
                    loading={loading}
                  >
                    Next
                  </Button>
                )}
                {current === steps.length - 1 && (
                  <Button
                    type="primary"
                    onClick={(e) => {
                      current === 0
                        ? handleCreateSolicitation(e)
                        : handleCreateBudget(e);
                    }}
                  >
                    Done
                  </Button>
                )}
                {current > 0 && (
                  <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                    Previous
                  </Button>
                )}
              </div>
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
    const { data } = await apiClient.get('/financial/solicitation-type');
    const paymentTypeResponse = await apiClient.get('/financial/payment-type');
    const costCenter = await apiClient.get('/financial/cost-center');
    const accountPlansResponse = await apiClient.get('financial/account-plan');
    const solicitation = await apiClient.get('financial/solicitation/me');

    return {
      props: {
        solicitationTypes: data,
        accountPlans: accountPlansResponse.data,
        costCenters: costCenter.data,
        paymentTypes: paymentTypeResponse.data,
        solicitations: solicitation.data,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        solicitationTypes: [],
        accountPlans: [],
        costCenters: [],
        paymentTypes: [],
      },
    };
  }
};
