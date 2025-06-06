import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { useTranslation } from "react-i18next";

const Header = ({ children, wineryId }) => {
  const router = useNavigate();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <div
        className={styles["product-header"]}
        style={{
          backgroundImage: `url('/images/background-${wineryId}.JPG')`,
        }}
      >
        <div className={styles["product-header-logo"]}>
          <picture>
            <img
              onClick={() => router("/")}
              src="/images/openvino-logo.png"
              alt="winery"
              style={{ width: 200 }}
            />
          </picture>

          <div
            className={styles["product-header-change"]}
            onClick={() => {
              navigate(-1);
            }}
          >
            {t("labels.change")}
          </div>
        </div>

        <div className={"container"}>{children}</div>
      </div>

      {/* <div className={styles["product-content"]}>
				<Tabs />
				<Sensors />
			</div> */}
    </>
  );
};

export default Header;
