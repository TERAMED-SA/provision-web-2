import "./Home.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// your JSX code here

import { FaUser } from "react-icons/fa";
import { TiGroup } from "react-icons/ti";

import LineChart from "../components/charts/LineChart";
import PieChart from "../components/charts/PieChart";

const Home = () => {
  return (
    <div className="p-3 bg-light">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 p-3">
            <div className="d-flex rounded justify-content-between p-4 align-items-center bg-button text-white border border-secondary shadow-sm">
              <i className="fs-1">
                <FaUser />
              </i>
              <div>
                <span className="size">Utilizadores</span>
                <h2 className="text-white">230</h2>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 p-3">
            <div className="d-flex rounded justify-content-between p-4 align-items-center bg-button text-white border border-secondary shadow-sm">
              <i className="fs-1">
                <TiGroup />
              </i>
              <div>
                <span className="size">Empresas</span>
                <h2 className="text-white">220</h2>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 p-3">
            <div className="d-flex rounded justify-content-between p-4 align-items-center bg-button text-white border border-secondary shadow-sm">
              <i className="fs-1">
                <TiGroup />
              </i>
              <div>
                <span className="size">Equipamentos</span>
                <h2 className="text-white">200</h2>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 p-3">
            <div className="d-flex rounded justify-content-between p-4 align-items-center bg-button text-white border border-secondary shadow-sm">
              <i className="fs-1">
                <TiGroup />
              </i>
              <div>
                <span className="size">Materiais</span>
                <h2 className="text-white">180</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12 col-md-8 p-3">
            <LineChart />
          </div>
          <div className="col-12 col-md-4 p-3">
            <PieChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
