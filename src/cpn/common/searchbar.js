import { useSelector } from "react-redux"

export default () => {
    const { lang } = useSelector(state => state)
    return(
        <div className="w-100 flex">
            <div className="input-group rounded">
                <input type="search" class="form-control rounded" placeholder={ lang["search"] } aria-label="Search" aria-describedby="search-addon" />
                <span className="input-group-text border-0 bg-primary">
                    <i className="fa fa-search text-light"></i>
                </span>
            </div>
        </div>
    )
}