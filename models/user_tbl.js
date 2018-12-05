"use strict";
const {crypto} = require('../routes/libs/utils')
const uuidv1 = require('uuid/v1')
const uuidv4 = require('uuid/v4')

function getId () {
    return new crypto().md5(uuidv1() + uuidv4())
}

// 定义用户表
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'user_tbl',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                unique: true,
                defaultValue: DataTypes.UUIDV1
            },
            user_id: {
                type: DataTypes.STRING,
                allowNull: false,
                get () {
                    return this.getDataValue('user_id');
                }
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                len: [4, 16],
                set (val) {
                    this.setDataValue('user_id', getId());
                }
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                len: [6, 16]
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true
            },
            mobile: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
                len: [11, 11]
            },
            // role_id: {
            //     type: DataTypes.INTEGER.UNSIGNED,
            //     defaultValue: 1
            // },
            created_at: {type: DataTypes.DATE, defaultValue: DataTypes.now},
            updated_at: {type: DataTypes.DATE, defaultValue: DataTypes.now},
            status: {
                type: DataTypes.INTEGER.UNSIGNED,
                defaultValue: 0,
                len: [1, 2]
            }
        },
        {
            // 不使用驼峰样式自动添加属性，而是下划线样式，因此updatedAt将变为updated_at
            underscored: true,
            // 禁用修改表名; 默认情况下，sequelize将自动将所有传递的模型名称（define的第一个参数）转换为复数。 如果你不想这样，请设置以下内容
            freezeTableName: true,
            classMethods: {},
            // 删除密码栏
            instanceMethods: {},
            getterMethods: {
                setId () {
                    return this.getDataValue('id');
                }
            },

            setterMethods: {
                setId (value) {
                    this.setDataValue('id', this.someMethod().md5(value));
                },
            }
        });
    User.associate = function (models) {
        User.belongsTo(
            models[`role_tbl`],
            {
                foreignKey: {
                    name: 'role',
                    allowNull: false,
                    defaultValue: 1
                }
            });
    };
    User.prototype.someMethod = function () {
        return {
            toJSON: function () {
                let values = this.get();
                delete values.password;
                return values;
            },
            md5 () {
                let values = this.get();
                return new crypto().md5(values.id)
            }
        }
    };
    return User;
};
