import { DashboardOutlined, OrderedListOutlined, MenuUnfoldOutlined, MenuFoldOutlined, ShopOutlined, CheckCircleOutlined, CustomerServiceFilled, CustomerServiceTwoTone, UserAddOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);

    const navigate = useNavigate();

    const items = [
        {
            key: '',
            label: 'Dashboard',
            type: 'item',
            icon: <DashboardOutlined />,
        },
        {
            key: 'orders',
            label: 'Orders',
            type: 'item',
            icon: <OrderedListOutlined />,
        },
        {
            key: 'factory',
            label: 'Your Factory',
            icon: <OrderedListOutlined />,
            children: [
                {
                    key: 'factory-1',
                    label: 'Status Factory 1',
                    icon: <ShopOutlined />,
                    children:
                        [
                            {
                                key: 'status/1',
                                label: 'Status',
                                type: 'item',
                                icon: <CheckCircleOutlined />
                            }
                        ]
                },
                {
                    key: 'factory-2',
                    label: 'Status Factory 2',
                    icon: <ShopOutlined />,
                    children:
                        [
                            {
                                key: 'status/2',
                                label: 'Status',
                                type: 'item',
                                icon: <CheckCircleOutlined />
                            }
                        ]
                },
                {
                    key: 'factory-3',
                    label: 'Status Factory 3',
                    icon: <ShopOutlined />,
                    children:
                        [
                            {
                                key: 'status/3',
                                label: 'Status',
                                type: 'item',
                                icon: <CheckCircleOutlined />
                            }
                        ]
                },

            ],
        },
        {
            key: 'customers',
            label: 'Customers',
            type: 'item',
            icon: <UserAddOutlined />,
        }
    ];

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };


    return (<div
        className={`flex flex-col bg-zinc-900 transition-all duration-200`}
        style={{
            width: collapsed ? 64 : 240,
            minWidth: collapsed ? 64 : 240,
            maxWidth: collapsed ? 64 : 240,
            overflowX: 'hidden',

            minHeight: '100vh'
        }}
    >
        {/* Logo Section */}
        <div className={`flex items-center justify-center p-4 border-b border-zinc-700 ${collapsed ? 'px-2' : 'px-4'}`}>            <img
                src="/MokaMetrics-Icon.png"
                alt="MokaMetrics"
                draggable="false"
                style={{ objectFit: 'contain' }}
                className={`transition-all duration-200 ${collapsed ? 'w-8 h-8' : 'w-12 h-12'}`}
            />
            {!collapsed && (
                <span className="ml-3 text-zinc-100 font-bold text-lg">
                    MokaMetrics
                </span>
            )}
        </div>

        <button
            className='m-2 bg-white rounded p-1 hover:border-teal-400 border transition-all hover:tracking-normal'
            type="button"
            onClick={toggleCollapsed}
        >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
        <Menu
            style={{
                backgroundColor: '#18181b',
                borderRight: 0,
                width: '100%',
                minWidth: 0,
                transition: 'width 0.2s'
            }}
            inlineCollapsed={collapsed}
            mode="inline"
            theme='dark'
            items={items}
            onClick={({ key }) => navigate(key)}
        />
    </div>
    );
}

export default Sidebar;