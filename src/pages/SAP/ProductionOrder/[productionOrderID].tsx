import { Row } from "antd";
import { GetServerSideProps } from "next";
import { getAPIClient } from "../../../services/axios";
import BarCode from 'react-barcode';
import styles from '../../../styles/barCode/tag.module.scss'
import { log } from "console";

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

interface IProductStructure {
  name: string;
}
interface IBarCode {
  id: string;
  production_order_id: string;
  serial_code: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  production_order: IProductionOrder;
  sequential: number;
  product_structure: IProductStructure;
}

interface IProps {
  barCodes: IBarCode[];
  isEstilo1: boolean;
}

export default function BarCodeTags({ barCodes, isEstilo1 }: IProps) {
  return (
    <div className={styles.container}>
      {!isEstilo1 && barCodes.map((barCode) => (
        <>
          <div className={styles.tag}>
            <b style={barCode.production_order.item_description.length < 93 ? { fontSize: 14 } : { fontSize: 12 }} className={styles.item_description}>{barCode.production_order.item_description}</b>
            <p className={styles.item_code}>
              {`${barCode.production_order.document_id} - ${barCode.production_order.item_code}`}
            </p>
            <p id='factorySector' className={styles.item_sector}>
              {`${barCode.product_structure ? barCode.product_structure.name : 'EMBALAGEM'}`}
            </p>
            <BarCode
              value={barCode.serial_code}
              width={1.5}
              height={40}
              fontSize={15}
            />
          </div>
        </>
      )
      )}
      {isEstilo1 && barCodes.map((barCode) => (
        <>
          <div className={styles.tag}>
            <b style={barCode[0].production_order.item_description.length < 93 ? { fontSize: 18 } : { fontSize: 16 }} className={styles.item_description}>{barCode[0].production_order.item_description}</b>
            <p className={styles.item_code}>
              {`${barCode[0].production_order.document_id} - ${barCode[0].production_order.item_code}`}
            </p>
            {barCode.map((barCodeItem) => (
              <>
                <p id='factorySector' className={styles.item_sector}>
                  {`${barCodeItem.product_structure ? barCodeItem.product_structure.name : 'EMBALAGEM'}`}
                </p>
                <BarCode
                  value={barCodeItem.serial_code}
                  width={1.5}
                  height={40}
                  fontSize={15}
                />
              </>
            ))}
          </div>
        </>
      )
      )}
    </div >
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);

  const { productionOrderID } = context.params;

  try {
    const response = await apiClient.get('sap/bar-code/production-order', {
      data: {
        production_order_id: productionOrderID
      }
    });

    let data = response.data;

    const isEstilo1 = data[0].production_order.distribution_rule === 'LINEST1' ? true : false;

    if (isEstilo1) {
      const sequentials = [];

      for (let index = 1; index <= data.length / 5; index++) {
        sequentials.push(data.filter((item) => item.sequential == index));

        sequentials[index - 1].sort((a, b) => parseFloat(a.product_structure.sequential_order) - parseFloat(b.product_structure.sequential_order));
      }

      data = sequentials;
    }

    console.log(data);


    return {
      props: {
        barCodes: data,
        isEstilo1,
      },
    };
  } catch (error) {
    console.log(error);

    return {
      props: {
        barCodes: [],
      },
    };
  }
};
