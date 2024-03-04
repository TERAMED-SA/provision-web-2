import './IconButton.css';

function IconButton({type, icon}){
    return (
        <div>
            <button 
                type={type}
                className='button_icon'
            >
                <i className='icon'>{icon}</i>
            </button>
        </div>
    );
}

export default IconButton;