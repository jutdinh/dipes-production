import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from "react";
import DiagramTable from './diagram-table';
import $ from 'jquery';



export default () => {

    const { tables, fields, offsetPoints, tableOffsets } = useSelector(state => state.database);

    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [tbOffsets, setTableOffsets] = useState([]);
    const [offsets, setOffsets] = useState([])

    const serializeData = () => {
        const serializedTables = tables.map(table => {
            const tableFields = fields.filter(field => field.table_id == table.table_id);
            table.fields = tableFields;
            return table;
        })
        return serializedTables;
    }

    useEffect(() => {
        const width = $('#hdxjhdksrhkhg').width();
        const height = $('#hdxjhdksrhkhg').height();
        setWidth(window.innerWidth); setHeight(window.innerHeight);
    }, [])

    useEffect(() => {
        if (offsetPoints) {
            setOffsets(offsetPoints)
        }
    }, [offsetPoints])

    useEffect(() => {
        if (tableOffsets) {
            setTableOffsets(tableOffsets)
        }
    }, [tableOffsets])

    const drawLines = (index, tables, start, end) => {
        const startTable = tables.filter(tb => tb.table_alias == start.table_alias)[0];
        const endTable = tables.filter(tb => tb.table_alias == end.table_alias)[0];
        const lines_1 = [
            `M ${start.offsetLeft} ${start.offsetTop} H ${start.offsetLeft - 25} `,
            `M ${start.offsetLeft - 25} ${start.offsetTop} V ${start.offsetTop >= end.offsetTop ? (startTable.offsetTop - 25) : startTable.offsetTop + startTable.offsetHeight + 25} `,
            `M ${start.offsetLeft - 25} ${start.offsetTop >= end.offsetTop ? (startTable.offsetTop - 25) : startTable.offsetTop + startTable.offsetHeight + 25} H ${start.offsetLeft > end.offsetLeft ? (end.offsetLeft + end.offsetWidth + 25) : (end.offsetLeft - 25)} `,
            `M ${start.offsetLeft > end.offsetLeft ? (end.offsetLeft + end.offsetWidth + 25) : (end.offsetLeft - 25)}  ${start.offsetTop >= end.offsetTop ? (startTable.offsetTop - 25) : startTable.offsetTop + startTable.offsetHeight + 25} H ${end.offsetLeft - 25} `,
            `M ${end.offsetLeft - 25}  ${start.offsetTop >= end.offsetTop ? (startTable.offsetTop - 25) : startTable.offsetTop + startTable.offsetHeight + 25} V ${end.offsetTop} `,
            `M ${end.offsetLeft - 25}  ${end.offsetTop} H ${end.offsetLeft + end.offsetWidth} `,
            // `M ${ end.offsetLeft + end.offsetWidth } ${ end.offsetTop } H ${ end.offsetLeft + end.offsetWidth + 25  } `,
            // ...drawMidLines(tables, start, end)                
        ]

        const lines_2 = [
            `M ${start.offsetLeft + start.offsetWidth} ${start.offsetTop} H ${start.offsetLeft + start.offsetWidth + 25}  `,
            `M ${start.offsetLeft + start.offsetWidth + 25} ${start.offsetTop} V ${start.offsetTop >= end.offsetTop ? (startTable.offsetTop - 25) : startTable.offsetTop + startTable.offsetHeight + 25} `,
            `M ${start.offsetLeft + start.offsetWidth + 25} ${start.offsetTop >= end.offsetTop ? (startTable.offsetTop - 25) : startTable.offsetTop + startTable.offsetHeight + 25} H ${end.offsetLeft + end.offsetWidth + 25}`,
            `M ${end.offsetLeft + end.offsetWidth + 25} ${start.offsetTop >= end.offsetTop ? (startTable.offsetTop - 25) : startTable.offsetTop + startTable.offsetHeight + 25} V ${end.offsetTop} `,
            `M ${end.offsetLeft + end.offsetWidth + 25} ${end.offsetTop} H ${end.offsetLeft}`
            // `M ${ start.offsetLeft + start.offsetWidth + 25 } ${ start.offsetTop } V ${ end.offsetTop }  `,
            // `M ${ start.offsetLeft + start.offsetWidth + 25 } ${ end.offsetTop } H ${ end.offsetLeft + end.offsetWidth }`,
            // ...drawMidLines(tables, start, end)                    
            // `M ${ end.offsetLeft } ${ end.offsetTop } H ${ end.offsetLeft + end.offsetWidth  }`,
        ]

        if (start.offsetLeft > end.offsetLeft) {
            return lines_1.join(' ')
        } else {
            return lines_2.join(' ')
        }
    }

    const pathGenerator = (index, offset) => {
        if (offset && tbOffsets) {
            const { start, end } = offset;
            console.log(offset)
            if (start != undefined && end != undefined) {
                const path = `                                   
                    ${drawLines(index, tbOffsets, start, end)}                                
                `
                return path
            }
        }
    }



    const autoColoring = () => {
        const arrayOfColorFunctions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']

        let randomColorString = '#';
        for (let i = 0; i < 6; i++) {

            let index = Math.floor(Math.random() * 16)
            let value = arrayOfColorFunctions[index]

            randomColorString += value
        }
        return randomColorString
    }

    const getTableFields = ({ id }) => {
        if (fields) {
            const tbFields = fields.filter(field => field.table_id === id);
            return tbFields;
        }
        return [];
    }
    return (
        <div className="_rel">
            <div className="_rel _z-index-1">
                <span className="_block _text-left _text-16-px d-none">Diagram {offsets.length}</span>
                <div className="_flex _flex-wrap" id="hdxjhdksrhkhg">
                    {serializeData().map(table =>
                        <DiagramTable table={table} fields={getTableFields(table)} />
                    )}
                </div>
            </div>
            <div className="_abs _t-0 _l-0 _z-index-0" style={{ width, height }}>
                <svg width={width} height={height}>
                    {offsets.map((point, index) =>
                        <path style={{ opacity: "0.5" }} key={index} d={pathGenerator(index, point)} stroke={autoColoring()} strokeWidth={3}></path>
                    )}
                </svg>
            </div>

        </div>
    )
}