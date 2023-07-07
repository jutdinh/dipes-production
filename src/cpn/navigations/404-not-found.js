import { useSelector } from "react-redux"

export default () => {

    const { lang } = useSelector( state => state );

    return(
        <div classNameName="inner_page login">
            <div class="full_container">
         <div class="container">
            <div class="center verticle_center full_height">
               <div class="error_page">
                  <div class="center">
                     <div class="error_icon">
                        <img class="img-responsive" src="/images/layout_img/error.png" alt="#"/>
                     </div>
                  </div>
                  <br/>
                  <h3>PAGE NOT FOUND !</h3>
                  <p>YOU SEEM TO BE TRYING TO FIND HIS WAY HOME</p>
                  <div class="center"><a class="main_bt" href="/">Go To Home Page</a></div>
               </div>
            </div>
         </div>
      </div>
      </div>
    )
}