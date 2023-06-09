import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import { visuallyHidden } from '@mui/utils';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import api from '../service/api';

const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

const getComparator = (order, orderBy) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const stableSort = (array, comparator) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: 'userCode',
    numeric: true,
    disablePadding: false,
    label: '작업자코드',
  },
  {
    id: 'name',
    numeric: true,
    disablePadding: false,
    label: '이름',
  },
  {
    id: 'state',
    numeric: true,
    disablePadding: false,
    label: '상태',
  },
];

const EnhancedTableHead = (props) => {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
    props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'center' : 'center'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const EnhancedTableToolbar = (props) => {
  const { numSelected, handleDelete, handleInsert } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} 선택
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          투입 작업자 목록
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Add">
          <IconButton onClick={handleInsert}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const TableUI = ({onValueChange, detailData}) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('useCode');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [value, setValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insertValue, setInsertValue] = useState('');
  const [showAlert, setShowAlert] = useState(true);

  const accessToken = sessionStorage.getItem('accessToken');
  // console.log(accessToken);

  console.log(detailData);

  useEffect(() => {
    api.get('/worker/list', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => {
        const listdata = response.data;
        const allrows = listdata.map((row) => {
          const prediction =
            detailData.list &&
            detailData.list.find((item) => item.userCode === row.userCode)
              ?.prediction;
          return {
            ...row,
            state: prediction || "",
          };
        });
        setRows(allrows);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        if (error.response.status === 403) {
          window.location.href = "/";
        } else {
          console.error(error);
        }
      });
  }, [accessToken, detailData.list]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.userCode);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, userCode) => {
    const selectedIndex = selected.indexOf(userCode);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, userCode);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const handleChangeDense = (event) => {
  //   setDense(event.target.checked);
  // };

  const handleDelete = () => {
    const updatedRows = rows.filter((row) => !selected.includes(row.userCode));
    setRows(updatedRows);
    setSelected([]);

    // 서버에 삭제 요청 보내기
    selected.forEach((userCode) => {
      api.delete('/worker/delete', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          userCode: parseFloat(userCode),
        },
      })
      .then((response) => {
        console.log('삭제 요청 성공:', response);
      })
      .catch((error) => {
        console.error('삭제 요청 실패:', error);
      });
    });

    onValueChange(updatedRows);
  };

  // const handleInputAddChange = (event) => {
  //   setValue(event.target.value);
  // };

  const handleInputChange = (event) => {
    setInsertValue(event.target.value);
  };

  const handleInputSearchChange = (event) => {
    setSearchValue(event.target.value);
  }

  const handleInsert = () => {
    if (!insertValue) {
      return;
    }
  
    const [userCode, name, gender, age, role] = insertValue.split(',');
    const newRow = { userCode, name };
    const updatedRows = [...rows, newRow];
    setRows(updatedRows);
    setInsertValue('');
    const newdata = { userCode, name, gender, age, role };

    // 서버에 추가 요청 보내기
    api.put('/worker/add', newdata, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    .then((response) => {
      console.log('추가 요청 성공:', response);
    })
    .catch((error) => {
      console.error('추가 요청 실패:', error);
    });

    setSelected([]);
  };

  const isSelected = (userCode) => selected.indexOf(userCode) !== -1;

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = useMemo(
    () =>
      stableSort(
        rows.filter((row) =>
          String(row.state).includes(searchValue)
        ),
        getComparator(order, orderBy)
      ).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, order, orderBy, page, rowsPerPage, searchValue],
  );
    
  useEffect(() => {
    if (!loading) {
      const tableData = () => {
        const data = visibleRows.map((row) => {
          // console.log(row.userCode);
          return row.userCode;
        });
        onValueChange(data);
      };

      tableData();
    }
  }, [loading, visibleRows]);

  useEffect(() => {
    const rowsWithRedText = rows.filter(row => row.state === 'fall');
    if (rowsWithRedText.length > 0 && showAlert) {
      alert("위험 작업자가 있습니다!");
      setShowAlert(false);
      
      setTimeout(() => {
        setShowAlert(true);
      }, 30000);
    }
  }, [rows, showAlert]);

  return (
    <Box sx={{ width: '100%' }} id="table-container">
        <Paper sx={{ width: '100%', mb: 2 }}>
            <EnhancedTableToolbar numSelected={selected.length} handleDelete={handleDelete} handleInsert={handleInsert} />
            <TableContainer component={Box} sx={{backgroundColor : '#FFD9D4'}}>
            <Table
                sx={{ minWidth: 550 }}
                aria-labelledby="tableTitle"
                size={dense ? 'small' : 'medium'}
            >
                <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
                />
                <TableBody>
                {visibleRows.map((row, index) => {
                    const isItemSelected = isSelected(row.userCode);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                    <TableRow
                        hover
                        onClick={(event) => handleClick(event, row.userCode)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.userCode}
                        selected={isItemSelected}
                        sx={{ cursor: 'pointer' }}
                    >
                        <TableCell padding="checkbox">
                        <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{
                            'aria-labelledby': labelId,
                            }}
                        />
                        </TableCell>
                        <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                        align='center'
                        sx={{ width: '40%' }}
                        >
                        {row.userCode}
                        </TableCell>
                        <TableCell align="center" sx={{ width: '30%' }}>{row.name}</TableCell>
                        <TableCell align="center" sx={{ width: '30%', color: row.state === 'fall' ? 'red' : 'black', fontWeight: row.state === 'fall' ? 'bold' : 'normal', fontSize: row.state === 'fall' ? '1.2em' : 'normal' }}>{row.state}</TableCell>
                    </TableRow>
                    );
                })}
                {emptyRows > 0 && (
                    <TableRow
                    style={{
                        height: (dense ? 33 : 53) * emptyRows,
                    }}
                    >
                    <TableCell colSpan={6} />
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </TableContainer>
            <TablePagination
            rowsPerPageOptions={[5, 10]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="페이지당 인원"
            sx={{bgcolor : '#FFD9D4'}}
            />
        </Paper>
        {/* <FormControlLabel
            control={<Switch checked={dense} onChange={handleChangeDense} />}
            label="Dense padding"
        /> */}
        <TextField
          label="Search"
          placeholder="검색"
          value={searchValue}
          onChange={handleInputSearchChange}
          color='secondary'
          sx={{ marginRight: '10px' }}
        />
        <TextField
          label="Add"
          placeholder="추가"
          value={insertValue}
          onChange={handleInputChange}
          color='secondary'
        />
    </Box>
  );
}

export default TableUI;