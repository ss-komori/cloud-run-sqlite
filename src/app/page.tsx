"use client";

import { useState, useEffect, ChangeEvent } from "react";
// import { Card, Row, Col, Input, Button, Table } from "antd";
// import { ColumnsType } from "antd/es/table";

interface DataType {
  key: string;
  id: number;
  content: string;
  createdAt: string;
  delete: string;
}

interface ColumnType<T> {
  title?: string;
  dataIndex: keyof T; // string型ではなくkeyof Tに変更
  width?: string;
  render?: (value: T[keyof T], record: T) => JSX.Element | string;
  sorter?: (a: T, b: T) => number;
}

export default function Home() {
  const [content, setContent] = useState("");
  const [dataSource, setDataSource] = useState<DataType[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const response = await fetch("/api/notes");
      const notes = await response.json();
      setDataSource(notes);
    };
    fetchNotes();
  }, []);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value);
  };

  const handleSaveClick = async () => {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    const notes = await response.json();
    setDataSource(notes);

    setContent("");
  };

  const handleDeleteClick = async (id: number) => {
    const response = await fetch(`/api/notes?id=${id}`, {
      method: "DELETE",
    });

    const notes = await response.json();
    setDataSource(notes);
  };

  const columns: ColumnType<DataType>[] = [
    {
      title: "created_at",
      dataIndex: "createdAt",
      width: "20%",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
    },
    {
      title: "content",
      dataIndex: "content",
      width: "75%",
    },
    {
      dataIndex: "delete",
      width: "5%",
      render: (_, record) => (
        <button
          className="px-4 py-1 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          onClick={() => handleDeleteClick(record.id)}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 border rounded-lg shadow-lg max-w-screen-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">Note</h2>
      <div className="flex items-center mb-4">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="content"
            value={content}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="ml-4">
          <button
            onClick={handleSaveClick}
            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save
          </button>
        </div>
      </div>
      <div className="mt-5">
        <table className="min-w-full bg-white border rounded-lg shadow-md">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-4 py-2 border-b bg-gray-100 text-left text-sm font-semibold text-gray-700"
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataSource.map((record) => (
              <tr key={record.id}>
                {columns.map((col, index) => (
                  <td
                    key={index}
                    className="px-4 py-2 border-b text-sm text-gray-700"
                  >
                    {col.render
                      ? col.render(record[col.dataIndex], record)
                      : record[col.dataIndex]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
