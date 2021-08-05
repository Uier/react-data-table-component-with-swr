import "./styles.css";
import useSWR from "swr";
import DataTable from "react-data-table-component";
import { LinearProgress } from "@material-ui/core";
import dayjs from "dayjs";
import { fetcher } from "./fetcher";
import { useMemo, useState } from "react";

const columns = [
  {
    name: "Number",
    selector: "number"
  },
  {
    name: "Title",
    selector: "title"
  },
  {
    name: "Created At",
    selector: "created_at",
    sortable: true,
    format: (row) => dayjs(row["created_at"]).format("YYYY/MM/DD HH:mm:ss")
  },
  {
    name: "Comments",
    selector: "comments",
    sortable: true,
  }
];

const baseUrl = "https://api.github.com/repos";
// api doc: https://docs.github.com/en/rest/reference/issues#list-issues-assigned-to-the-authenticated-user--parameters

export default function App() {
  const [input, setInput] = useState("facebook/react")
  const [repo, setRepo] = useState(input)
  const [page, setPage] = useState(1);
  const [rowPerPage, setRowPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(true)

  const key = useMemo(() => {
    return `${baseUrl}/${repo}/issues?page=${page}&per_page=${rowPerPage}&sort=${sortBy}&direction=${sortDirection}`;
  }, [repo, page, rowPerPage, sortBy, sortDirection]);

  // fetch Issues
  const { data: issueData, error: issueError } = useSWR(key, fetcher);

  // fetch repo info to get the total open issues count
  const { data: repoData, error: repoError } = useSWR(`${baseUrl}/${repo}`, fetcher);

  return (
    <div className="App">
      <pre>react-data-table-component + SWR</pre>
      <input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="facebook/react"
      />
      <button
        onClick={() => {
          setRepo(input);
          setResetPaginationToggle((val) => !val)
        }}
      >Load Issues</button>
      {issueError || repoError ? (
        <>
          <h1>An error has occurred, please make sure the repository exists.</h1>
          <pre>error message:</pre>
          <pre>{ issueError?.response?.data?.message }</pre>
        </>
      ) : (
        <DataTable
          title={`${repo} GitHub Issue List`}
          columns={columns}
          data={issueData}
          persistTableHead
          highlightOnHover
          sortServer
          onSort={(column, direction) => {
            setSortBy(column.selector);
            setSortDirection(direction);
          }}
          pagination
          paginationResetDefaultPage={!resetPaginationToggle}
          paginationTotalRows={repoData?.open_issues_count}
          paginationServer
          onChangePage={(page) => setPage(page)}
          onChangeRowsPerPage={(rowsPerPage) => setRowPerPage(rowsPerPage)}
          progressPending={!issueData || !repoData}
          progressComponent={
            <div style={{ width: "100%" }}>
              <LinearProgress />
            </div>
          }
        />
      )}
      <div style={{ position: 'fixed', bottom: 0 }}>
        <a href="https://github.com/Uier/react-data-table-component-with-swr">
          <pre>GitHub Repo</pre>
        </a>
      </div>
    </div>
  );
}
