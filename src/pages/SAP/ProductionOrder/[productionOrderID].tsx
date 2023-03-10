import { Row } from "antd";
import { GetServerSideProps } from "next";
import { getAPIClient } from "../../../services/axios";
import BarCode from 'react-barcode';
import styles from '../../../styles/barCode/tag.module.scss'

interface IProductionOrder {
  id: string;
  document_id: string;
  item_code: string;
  item_description: string;
  planned_quantity: number;
  unit_of_measurement: string;
  warehouse: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
  user_id: string;
}

interface IBarCode {
  id: string;
  production_order_id: string;
  serial_code: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  production_order: IProductionOrder;
}

interface IProps {
  barCodes: IBarCode[];
}

export default function BarCodeTags({ barCodes }: IProps) {
  return (
    <div className={styles.container}>
      {barCodes.map((barCode) => (
        <>
          <div className={styles.tag}>
            <b className={styles.item_description}>{barCode.production_order.item_description}</b>
            <p className={styles.item_code}>
              {`${barCode.production_order.document_id} - ${barCode.production_order.item_code}`}
            </p>
            <BarCode
              value={barCode.serial_code}
              width={1.5}
              height={40}
              fontSize={15}
            />
          </div>
        </>
      ))}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);

  const { productionOrderID } = context.params;

  console.log(productionOrderID);

  try {
    const response = await apiClient.get('sap/bar-code/production-order', {
      data: {
        production_order_id: productionOrderID
      }
    });

    const data = response.data;

    return {
      props: {
        barCodes: data,
      },
    };
  } catch (error) {
    console.log(error.response.data.message);

    return {
      props: {
        barCodes: [],
      },
    };
  }
};
