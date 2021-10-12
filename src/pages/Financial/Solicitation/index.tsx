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
} from 'antd';
import { GetServerSideProps } from 'next';
import React, { useState } from 'react';
import styles from '../../../styles/app.module.scss';
import localStyles from './styles.module.scss';
import { getAPIClient } from '../../../services/axios';
import SolicitationType from '../SolicitationType/index';
import CenterCost from '../CostCenter/index';
import { api } from '../../../services/api';

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

interface IProps {
  solicitationTypes: ISolicitationType[];
  accountPlans: IAccountPlan[];
  costCenters: ICostCenter[];
  paymentTypes: IPaymentType[];
}

export default function Solicitation({
  solicitationTypes,
  accountPlans,
  costCenters,
  paymentTypes,
}: IProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpenModal, setIsModalOpen] = useState(false);
  const [current, setCurrent] = useState(0);
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
  const [budgetObservation, setBudgetObservation] = useState<string>('');
  const [budget];

  function handleAddCenterCost(value) {
    setCostCentersAdded(value);
    console.log(costCentersAdded);
  }

  async function handleCreateSolicitation(e) {
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

  async function handleCreateBudget() {}

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
      title: 'Orçamentos',
      content: (
        <>
          <h1>AAAA</h1>
        </>
      ),
    },
  ];

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  async function handleRegister() {}

  async function handleClose() {}

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
        {/* <SearchTable /> */}
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
                        : handleCreateBudget
                    }
                    loading={loading}
                  >
                    Next
                  </Button>
                )}
                {current === steps.length - 1 && (
                  <Button
                    type="primary"
                    onClick={() => message.success('Processing complete!')}
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
    return {
      props: {
        solicitationTypes: data,
        accountPlans: accountPlansResponse.data,
        costCenters: costCenter.data,
        paymentTypes: paymentTypeResponse.data,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        solicitationTypes: [],
        accountPlans: [],
        costCenters: [],
      },
    };
  }
};
