<?php
/***************************************************************************
 *                                                                          *
 *   (c) 2004 Vladimir V. Kalynyak, Alexey V. Vinokurov, Ilya M. Shalnev    *
 *                                                                          *
 * This  is  commercial  software,  only  users  who have purchased a valid *
 * license  and  accept  to the terms of the  License Agreement can install *
 * and use this program.                                                    *
 *                                                                          *
 ****************************************************************************
 * PLEASE READ THE FULL TEXT  OF THE SOFTWARE  LICENSE   AGREEMENT  IN  THE *
 * "copyright.txt" FILE PROVIDED WITH THIS DISTRIBUTION PACKAGE.            *
 ****************************************************************************/

namespace Tygh\Backend\Database;

use PDOException;

/**
 * Class Pdo
 *
 * phpcs:disable SlevomatCodingStandard.TypeHints.DisallowMixedTypeHint
 */
class Pdo implements IBackend
{
    const PDO_MYSQL_ATTR_INIT_COMMAND = 1002;

    /**
     * @var \PDO The PDO connection instance.
     */
    private $conn;

    /**
     * @var mixed The last result retrieved.
     */
    private $last_result;

    /**
     * @inheritDoc
     */
    public function connect($user, $passwd, $host, $database)
    {
        if (!$host || !$user) {
            return false;
        }

        @list($host) = explode(':', $host);

        try {
            // phpcs:ignore
            $this->conn = new \PDO(
                "mysql:host=$host;dbname=$database",
                $user,
                $passwd,
                // phpcs:ignore
                [
                    \PDO::ATTR_ERRMODE           => \PDO::ERRMODE_SILENT,
                    \PDO::ATTR_STRINGIFY_FETCHES => true
                ]
            );
        } catch (PDOException $e) {
            return false;
        }

        return !empty($this->conn);
    }

    /**
     * @inheritDoc
     */
    public function disconnect()
    {
        return $this->conn = null;
    }

    /**
     * @inheritDoc
     */
    public function changeDb($database)
    {
        return ($this->conn->exec("USE `{$database}`") !== false);
    }

    /**
     * @inheritDoc
     */
    public function query($query)
    {
        $result = $this->conn->query($query);
        $this->last_result = $result;

        // need to return true for insert/replace/update/delete/alter query
        if (!empty($result) && preg_match('/^(INSERT|REPLACE|UPDATE|DELETE|ALTER)/', $result->queryString)) {
            return true;
        }

        return $result;
    }

    /**
     * @inheritDoc
     */
    public function fetchRow($result, $type = 'assoc')
    {
        if ($type === 'assoc') {
            return $result->fetch(\PDO::FETCH_ASSOC);
        }

        return $result->fetch(\PDO::FETCH_NUM);
    }

    /**
     * @inheritDoc
     */
    public function freeResult($result)
    {
        return $result->closeCursor();
    }

    /**
     * @inheritDoc
     */
    public function affectedRows($result)
    {
        if (is_object($result)) {
            return $result->rowCount();
        }

        if (is_object($this->last_result)) {
            return $this->last_result->rowCount();
        }

        return 0;
    }

    /**
     * @inheritDoc
     *
     * @psalm-suppress InvalidReturnType
     */
    public function insertId()
    {
        return $this->conn->lastInsertId();
    }

    /**
     * @inheritDoc
     */
    public function errorCode()
    {
        $err = $this->conn->errorInfo();

        return (int) $err[1];
    }

    /**
     * @inheritDoc
     */
    public function error()
    {
        $err = $this->conn->errorInfo();

        return $err[2];
    }

    /**
     * @inheritDoc
     */
    public function escape($value)
    {
        return substr($this->conn->quote($value), 1, -1);
    }

    /**
     * @inheritDoc
     */
    public function initCommand($command)
    {
        if (empty($command)) {
            return;
        }

        $this->query($command);
        //$this->conn->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, $command);
        // FIXME: Workaround: Fatal error: Undefined class constant 'MYSQL_ATTR_INIT_COMMAND'
        // https://bugs.php.net/bug.php?id=47224
        // http://stackoverflow.com/questions/2424343/undefined-class-constant-mysql-attr-init-command-with-pdo
        // You should have extra extension to make it work or use 1002 instead

        $this->conn->setAttribute(self::PDO_MYSQL_ATTR_INIT_COMMAND, $command);
    }

    /**
     * @inheritDoc
     */
    public function getVersion()
    {
        $version = 0;

        if (
            preg_match(
                '/^(?<major>\d+)\.(?<minor>\d+)\.(?<subver>\d+)/',
                $this->conn->getAttribute(\PDO::ATTR_SERVER_VERSION),
                $matches
            )
        ) {
            $version = ($matches['major'] * 10000) + ($matches['minor'] * 100) + $matches['subver'];
        }

        return $version;
    }

    /**
     * @inheritDoc
     */
    public function beginTransaction()
    {
        return $this->conn->beginTransaction();
    }

    /**
     * @inheritDoc
     */
    public function commit()
    {
        return $this->conn->commit();
    }

    /**
     * @inheritDoc
     */
    public function rollback()
    {
        return $this->conn->rollback();
    }
}
