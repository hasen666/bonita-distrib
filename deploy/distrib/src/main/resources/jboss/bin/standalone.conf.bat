rem ### -*- batch file -*- ######################################################
rem #                                                                          ##
rem #  JBoss Bootstrap Script Configuration                                    ##
rem #                                                                          ##
rem #############################################################################

rem # $Id: run.conf.bat 88820 2009-05-13 15:25:44Z dimitris@jboss.org $

rem #
rem # This batch file is executed by run.bat to initialize the environment
rem # variables that run.bat uses. It is recommended to use this file to
rem # configure these variables, rather than modifying run.bat itself.
rem #

rem Uncomment the following line to disable manipulation of JAVA_OPTS (JVM parameters)
rem set PRESERVE_JAVA_OPTS=true

if not "x%JAVA_OPTS%" == "x" (
  echo "JAVA_OPTS already set in environment; overriding default settings with values: %JAVA_OPTS%"
  goto JAVA_OPTS_SET
)

rem #
rem # Specify the JBoss Profiler configuration file to load.
rem #
rem # Default is to not load a JBoss Profiler configuration file.
rem #
rem set "PROFILER=%JBOSS_HOME%\bin\jboss-profiler.properties"

rem #
rem # Specify the location of the Java home directory (it is recommended that
rem # this always be set). If set, then "%JAVA_HOME%\bin\java" will be used as
rem # the Java VM executable; otherwise, "%JAVA%" will be used (see below).
rem #
rem set "JAVA_HOME=C:\opt\jdk1.6.0_23"

rem #
rem # Specify the exact Java VM executable to use - only used if JAVA_HOME is
rem # not set. Default is "java".
rem #
rem set "JAVA=C:\opt\jdk1.6.0_23\bin\java"

rem #
rem # Specify options to pass to the Java VM. Note, there are some additional
rem # options that are always passed by run.bat.
rem #

rem # JVM memory allocation pool parameters - modify as appropriate.
set "JAVA_OPTS=-Xms1024M -Xmx1024M -XX:MaxPermSize=256M -XX:+HeapDumpOnOutOfMemoryError"

rem # Reduce the RMI GCs to once per hour for Sun JVMs.
set "JAVA_OPTS=%JAVA_OPTS% -Dsun.rmi.dgc.client.gcInterval=3600000 -Dsun.rmi.dgc.server.gcInterval=3600000 -Djava.net.preferIPv4Stack=true"

rem # Warn when resolving remote XML DTDs or schemas.
set "JAVA_OPTS=%JAVA_OPTS% -Dorg.jboss.resolver.warning=true"

rem # Make Byteman classes visible in all module loaders
rem # This is necessary to inject Byteman rules into AS7 deployments
set "JAVA_OPTS=%JAVA_OPTS% -Djboss.modules.system.pkgs=org.jboss.byteman"

rem # Set the default configuration file to use if -c or --server-config are not used
set "JAVA_OPTS=%JAVA_OPTS% -Djboss.server.default.config=standalone.xml"

rem # Sample JPDA settings for remote socket debugging
rem set "JAVA_OPTS=%JAVA_OPTS% -Xrunjdwp:transport=dt_socket,address=8787,server=y,suspend=n"

rem # Sample JPDA settings for shared memory debugging
rem set "JAVA_OPTS=%JAVA_OPTS% -Xrunjdwp:transport=dt_shmem,address=jboss,server=y,suspend=n"

rem # Use JBoss Modules lockless mode
rem set "JAVA_OPTS=%JAVA_OPTS% -Djboss.modules.lockless=true"

:JAVA_OPTS_SET

# Enable GZIP compression:
rem set "JAVA_OPTS=%JAVA_OPTS% -Dorg.apache.coyote.http11.Http11Protocol.COMPRESSION=on"

rem Sets some variables
set tmp_jboss_home=%~dp0/..
set "BONITA_HOME=-Dbonita.home="%tmp_jboss_home%/bonita""
set "DB_OPTS=-Dsysprop.bonita.db.vendor=h2 -Dbonita.h2.port=1234 -Dsysprop.bonita.database.journal.datasource.name=java:jboss/datasources/bonitaDS -Dsysprop.bonita.database.sequence.manager.datasource.name=java:jboss/datasources/bonitaSequenceManagerDS"
set "HIBERNATE_OPTS=-Dsysprop.bonita.hibernate.transaction.jta_platform=org.hibernate.service.jta.platform.internal.JBossAppServerJtaPlatform -Dsysprop.bonita.hibernate.transaction.manager_lookup_class=org.bonitasoft.JBoss7TransactionManagerLookup -Dsysprop.bonita.transaction.manager=java:jboss/TransactionManager -Dsysprop.bonita.userTransaction=java:jboss/UserTransaction"
set "ENCODING_OPTS=-Dfile.encoding=UTF-8 "
set "BONITA_OPTS=%BONITA_HOME% %DB_OPTS% %HIBERNATE_OPTS% %ENCODING_OPTS%"
set "JAVA_OPTS=%JAVA_OPTS% %BONITA_OPTS%"
goto :eof
