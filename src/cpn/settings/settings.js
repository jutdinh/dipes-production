import { useSelector } from "react-redux"

import { Header, Dropdown } from "../common"
import { useEffect, useState } from "react";

import $ from 'jquery';

export default () => {
    const { lang, socket } = useSelector(state => state);
    const [defaultValue, setDefaultValue] = useState({})

    const [pageState, setPageState] = useState(0);



    const langs = [
        { id: 0, label: "Tiếng Việt", value: "Vi" },
        { id: 1, label: "English", value: "En" },
    ]

    useEffect(() => {
        let langItem = localStorage.getItem("lang");
        langItem = langItem ? langItem : "Vi";
        const defaultLang = langs.filter(l => l.value == langItem)[0]
        setDefaultValue(defaultLang)
    }, [])

    const changeTheme = () => {

        if (!pageState) {
            $('head').append(`
                <link id="second-stype-sheet" rel="stylesheet" href="css/color_2.css" />
            `)
        } else {
            $('#second-stype-sheet').remove()
        }

        setPageState(!pageState)
    }

    const setLanguage = ({ value }) => {
        localStorage.setItem("lang", value);
        window.location.reload()
    }

    return (

        <div className="container-fluid">
            <div class="midde_cont">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title">
                            <h2>{lang["settings.title"]}</h2>
                        </div>
                    </div>
                </div>
                <div class="row column1">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            <div class="row column4 graph">
                                <div class="col-md-12">
                                    <div class="white_shd full margin_bottom_30">
                                        <div class="full graph_head">
                                            <div class="heading1 margin_0">
                                                <h2>{lang["settings.languages"]}</h2>
                                            </div>
                                        </div>
                                        <div className="col-md-4 d-flex flex-nowrap row align-items-center mt-2">
                                            <div className="col-md-6">

                                            </div>
                                            <div className="col-md-6">
                                                <Dropdown options={langs} func={setLanguage} defaultValue={defaultValue} fitWidth={true} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-12">
                                    <div class="white_shd full margin_bottom_30">
                                        <div class="full graph_head">
                                            <div class="heading1 margin_0">
                                                <h2>{lang["settings.color"]}</h2>
                                            </div>
                                        </div>
                                        <div className="col-md-4 d-flex flex-nowrap row align-items-center mt-2">
                                            <div className="col-md-6">

                                            </div>
                                            <div className="col-md-6">
                                                <button className="btn btn-primary" onClick={changeTheme} style={{ minWidth: "120px" } }>{lang["settings.color button"]}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>                               

                            </div>
                        </div>
                    </div>

                </div>

            </div>

        </div>




    )
}