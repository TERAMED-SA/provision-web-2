import { React } from 'react';

function CardDashboard({type, text, number, icon}){
    return (
        <div className='col-lg-3 col-md-6 col-sm-12'>
            <div className='p-3 bg-prim shadow-sm d-flex justify-content-center aligms-items rounded'>
                <div>
                    <h3 className='fs-2 text-white'>{number}</h3>
                    <p className='fs-5 text-white'>{text}</p>
                </div>
                <i className='p-3 fs-1 text-white'>{icon}</i>
            </div>
        </div>
    );
}

export default CardDashboard;