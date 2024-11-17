import React from "react";
import { BsCurrencyBitcoin, BsArrowRight } from "react-icons/bs";
import { FaEthereum } from "react-icons/fa";
import { SiHedera } from "react-icons/si";
import { AiOutlineCloudDownload } from "react-icons/ai";

  const Banner = ({ transferNativeToken }) => {
    return(
      <section id="home_section"
      className="section_banner bg_black_dark"
      data-zindex="1" data-parallax="scroll"
      data-image-src="assets/images/banner_bg2.png"
      >
      <div className="banner_effect"> </div>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-12 col-sm-12 order-lg-first">
              <div className="banner_text_s2 text_md_center">
                <h1 className="animation text-white"
                data-animation="fadeInUp"
                data-animation-delay="1.1s"
                >
                <strong>IVY</strong> is the biggest advancement in DEFI for 
                <strong> Hedera</strong>
                </h1>
                <h5 className="animation presale_txt text-white"
                data-animation="fadeInUp"
                data-animation-delay="1.3s">
                  Token Presale is <mark className="gradient_box">
                    Live
                  </mark>
                </h5>
                <div className="btn_group pt-2 pb-3 animation"
                 data-animation="fadeInUp"
                data-animation-delay="1.4s">
                <a href="https://www.ivyfinance.io/"
                className="btn btn-default btn-radius nav-link content-popup"
               target="_blank"
                >
                  Whitepaper
                </a>
                <a href="#token" className="btn btn-border btn-radius">
                  Buy Token Now!
                </a>
                
             { /* <a onClick={()=> transferNativeToken()} className="btn btn-border btn-radius">
                   Transfer Token<BsArrowRight/>
                </a> */}

                </div>
                <span className="text-white
                icon_title animation"
                data-animation="fadeInUp"
                data-animation-delay="1.4s"
                >
                  Buy yours with:
                </span>
                <ul className="list_none currency_icon">
                <li className="animation"
                 data-animation="fadeInUp"
                data-animation-delay="1.5s">
                <span className="new_icon_style">
                  <SiHedera className="new_font_size" />
                </span>
                <span>Hedera</span>
                </li>
               




                </ul>
                <div className="team_pop mfp-hide"
                id="whitepaper">
                  <div className="row m-0">
                    <div className="col-md-7">
                      <div className="pt-3 pb-3">
                        <div className="title_dark title_border">
                       <h4> Download Whitepaper</h4>
                       <p>
                       Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.


 


                       </p>
                       <a  href="#" className="btn btn-default btn-radius ">
                        Download Now
                        <AiOutlineCloudDownload />
                       </a>

                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                    <img
                    src="../styles/assets/images/whitepaper.png"
                    alt="whitepaper"
                    className="pt-3 pb-3" />


                    </div>
 
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-12 col-sm-12 order-first">
             <div className="banner_image_right res_md_mb_50 res_xs_mb_30 animation"
             data-animation="fadeInRight"
             data-animation-delay="1.5s">
               <img
               src="./../styles/assets/images/banner_img2.png"
               alt="img"
               className="new_image_css"
               />



             </div>

            </div>

          </div>
        </div>
     


      </section>




    );

  
};

export default Banner;
