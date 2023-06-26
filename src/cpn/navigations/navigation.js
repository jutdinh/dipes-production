import { Navbar, Topbar } from '../navbar';

export default (props) => {
    const { Child } = props
    return(
        <div>           
            <Navbar/>
            <div id="content">
                <Topbar/>
                <Child />
            </div>
        </div>
    )
}